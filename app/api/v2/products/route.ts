import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'
import { computeReadinessScore } from '@/lib/v2/readiness'
import { generateSlug } from '@/lib/v2/slug'

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().max(100).optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  badges: z.array(z.enum(['NEW', 'FEATURED', 'PROMO', 'LIMITED', 'BESTSELLER', 'SEASONAL'])).optional(),
  highlights: z.array(z.string().max(200)).max(5).optional(),
  presentationNotes: z.string().optional(),
  priceCents: z.number().int().min(0).optional(),
  isPurchasable: z.boolean().optional(),
  displayStatus: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'SEASONAL']).optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:read')
  if (perm) return perm

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const categoryId = searchParams.get('categoryId') ?? undefined
  const brandId = searchParams.get('brandId') ?? undefined
  const displayStatus = searchParams.get('displayStatus') ?? undefined
  const search = searchParams.get('search') ?? undefined

  const products = await prismaV2.v2Product.findMany({
    where: {
      shopId: ctx.shopId,
      ...(categoryId ? { categoryId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(displayStatus ? { displayStatus: displayStatus as any } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { tags: { has: search } },
            ],
          }
        : {}),
    },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      media: { orderBy: [{ role: 'asc' }, { sortOrder: 'asc' }], take: 1 },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = products.length > limit
  const items = hasMore ? products.slice(0, limit) : products

  return ok(items, {
    pagination: {
      nextCursor: hasMore ? items[items.length - 1].id : null,
      hasMore,
    },
  })
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid product data', parsed.error.flatten())
  }

  const data = parsed.data
  const slug = data.slug ?? generateSlug(data.title)

  // Check slug uniqueness within shop
  const existing = await prismaV2.v2Product.findUnique({
    where: { shopId_slug: { shopId: ctx.shopId, slug } },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict(`A product with slug '${slug}' already exists`)
  }

  const readiness = computeReadinessScore({
    title: data.title,
    shortDescription: data.shortDescription ?? null,
    longDescription: data.longDescription ?? null,
    priceCents: data.priceCents ?? null,
    isPurchasable: data.isPurchasable ?? true,
    categoryId: data.categoryId ?? null,
    brandId: data.brandId ?? null,
    mediaCount: 0,
  })

  const product = await prismaV2.v2Product.create({
    data: {
      shopId: ctx.shopId,
      title: data.title,
      shortDescription: data.shortDescription ?? null,
      longDescription: data.longDescription ?? null,
      slug,
      sku: data.sku ?? null,
      brandId: data.brandId ?? null,
      categoryId: data.categoryId ?? null,
      tags: data.tags ?? [],
      badges: data.badges ?? [],
      highlights: data.highlights ?? [],
      presentationNotes: data.presentationNotes ?? null,
      priceCents: data.priceCents ?? null,
      isPurchasable: data.isPurchasable ?? true,
      displayStatus: data.displayStatus ?? 'DRAFT',
      publicationReadiness: readiness,
    },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      media: true,
      variants: true,
    },
  })

  return created(product)
}
