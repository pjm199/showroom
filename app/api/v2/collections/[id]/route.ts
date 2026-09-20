import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  slug: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).nullable().optional(),
  description: z.string().nullable().optional(),
  type: z.enum(['SEASONAL', 'PROMO', 'EDITORIAL', 'LAUNCH', 'OUTLET', 'B2B']).optional(),
  heroAssetId: z.string().nullable().optional(),
  startAt: z.string().datetime().nullable().optional(),
  endAt: z.string().datetime().nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'collections:read')
  if (perm) return perm

  const collection = await prismaV2.v2Collection.findFirst({
    where: { id, shopId: ctx.shopId },
    include: {
      items: {
        include: { product: { select: { id: true, title: true, slug: true, displayStatus: true } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  if (!collection) return errors.notFound('Collection')

  return ok(collection)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'collections:write')
  if (perm) return perm

  const collection = await prismaV2.v2Collection.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true, slug: true },
  })
  if (!collection) return errors.notFound('Collection')

  const body = await request.json().catch(() => null)
  const parsed = updateCollectionSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid collection data', parsed.error.flatten())
  }

  const data = parsed.data

  if (data.slug && data.slug !== collection.slug) {
    const conflict = await prismaV2.v2Collection.findUnique({
      where: { shopId_slug: { shopId: ctx.shopId, slug: data.slug } },
      select: { id: true },
    })
    if (conflict && conflict.id !== id) {
      return errors.conflict(`A collection with slug '${data.slug}' already exists`)
    }
  }

  const updated = await prismaV2.v2Collection.update({
    where: { id },
    data: {
      ...data,
      startAt: data.startAt !== undefined ? (data.startAt ? new Date(data.startAt) : null) : undefined,
      endAt: data.endAt !== undefined ? (data.endAt ? new Date(data.endAt) : null) : undefined,
    },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })

  return ok(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'collections:delete')
  if (perm) return perm

  const collection = await prismaV2.v2Collection.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!collection) return errors.notFound('Collection')

  await prismaV2.v2Collection.delete({ where: { id } })
  return noContent()
}
