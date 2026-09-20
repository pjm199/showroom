import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'
import { generateSlug } from '@/lib/v2/slug'

const createCollectionSchema = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).optional(),
  description: z.string().optional(),
  type: z.enum(['SEASONAL', 'PROMO', 'EDITORIAL', 'LAUNCH', 'OUTLET', 'B2B']),
  heroAssetId: z.string().nullable().optional(),
  startAt: z.string().datetime().nullable().optional(),
  endAt: z.string().datetime().nullable().optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'collections:read')
  if (perm) return perm

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') ?? undefined
  const isActive = searchParams.get('isActive')
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)

  const collections = await prismaV2.v2Collection.findMany({
    where: {
      shopId: ctx.shopId,
      ...(type ? { type: type as any } : {}),
      ...(isActive !== null ? { isActive: isActive === 'true' } : {}),
    },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = collections.length > limit
  const items = hasMore ? collections.slice(0, limit) : collections

  return ok(items, {
    pagination: { nextCursor: hasMore ? items[items.length - 1].id : null, hasMore },
  })
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'collections:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createCollectionSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid collection data', parsed.error.flatten())
  }

  const data = parsed.data
  const slug = data.slug ?? generateSlug(data.name)

  const existing = await prismaV2.v2Collection.findUnique({
    where: { shopId_slug: { shopId: ctx.shopId, slug } },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict(`A collection with slug '${slug}' already exists`)
  }

  const collection = await prismaV2.v2Collection.create({
    data: {
      shopId: ctx.shopId,
      name: data.name,
      slug,
      subtitle: data.subtitle ?? null,
      description: data.description ?? null,
      type: data.type,
      heroAssetId: data.heroAssetId ?? null,
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
    include: { items: true },
  })

  return created(collection)
}
