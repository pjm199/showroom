import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createPageSchema = z.object({
  type: z.enum(['HOMEPAGE', 'CATEGORY', 'COLLECTION', 'LANDING', 'BRAND']),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  canonicalRef: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:read')
  if (perm) return perm

  const type = request.nextUrl.searchParams.get('type') ?? undefined

  const pages = await prismaV2.v2Page.findMany({
    where: {
      shopId: ctx.shopId,
      ...(type ? { type: type as any } : {}),
    },
    include: {
      versions: {
        where: { status: 'PUBLISHED' },
        take: 1,
        select: { id: true, status: true, publishedAt: true },
      },
      _count: { select: { versions: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return ok(pages)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createPageSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid page data', parsed.error.flatten())
  }

  const data = parsed.data

  // Only one HOMEPAGE per shop
  if (data.type === 'HOMEPAGE') {
    const existing = await prismaV2.v2Page.findFirst({
      where: { shopId: ctx.shopId, type: 'HOMEPAGE' },
      select: { id: true },
    })
    if (existing) {
      return errors.conflict('A homepage already exists for this shop')
    }
  }

  const existingSlug = await prismaV2.v2Page.findUnique({
    where: { shopId_slug: { shopId: ctx.shopId, slug: data.slug } },
    select: { id: true },
  })
  if (existingSlug) {
    return errors.conflict(`A page with slug '${data.slug}' already exists`)
  }

  const page = await prismaV2.$transaction(async (tx) => {
    const newPage = await tx.v2Page.create({
      data: {
        shopId: ctx.shopId,
        type: data.type,
        slug: data.slug,
        title: data.title,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        canonicalRef: data.canonicalRef ?? null,
      },
    })

    // Auto-create an empty DRAFT version
    await tx.v2PageVersion.create({
      data: {
        pageId: newPage.id,
        status: 'DRAFT',
        label: 'Initial draft',
        createdBy: ctx.userId,
      },
    })

    return tx.v2Page.findUnique({
      where: { id: newPage.id },
      include: {
        versions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
  })

  return created(page)
}
