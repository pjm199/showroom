import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, noContent, errors } from '@/lib/v2/response'

const addItemSchema = z.object({
  productId: z.string().min(1),
  sortOrder: z.number().int().optional(),
  notes: z.string().optional(),
  customPriceCents: z.number().int().min(0).optional(),
})

const reorderSchema = z.object({
  orderedProductIds: z.array(z.string()),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: catalogId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const catalog = await prismaV2.v2B2BCatalog.findFirst({
    where: { id: catalogId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!catalog) return errors.notFound('B2B catalog')

  // Reorder path
  const url = new URL(request.url)
  if (url.pathname.endsWith('/reorder')) {
    const body = await request.json().catch(() => null)
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return errors.validation('Invalid reorder data', parsed.error.flatten())
    }

    const updates = parsed.data.orderedProductIds.map((productId, index) =>
      prismaV2.v2B2BCatalogItem.updateMany({
        where: { catalogId, productId },
        data: { sortOrder: index },
      })
    )
    await prismaV2.$transaction(updates)

    const items = await prismaV2.v2B2BCatalogItem.findMany({
      where: { catalogId },
      orderBy: { sortOrder: 'asc' },
    })
    return ok(items)
  }

  // Add item
  const body = await request.json().catch(() => null)
  const parsed = addItemSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid item data', parsed.error.flatten())
  }

  const existing = await prismaV2.v2B2BCatalogItem.findUnique({
    where: {
      catalogId_productId: { catalogId, productId: parsed.data.productId },
    },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict('Product is already in this catalog')
  }

  const item = await prismaV2.v2B2BCatalogItem.create({
    data: {
      catalogId,
      productId: parsed.data.productId,
      sortOrder: parsed.data.sortOrder ?? 0,
      notes: parsed.data.notes ?? null,
      customPriceCents: parsed.data.customPriceCents ?? null,
    },
  })

  return created(item)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: catalogId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  return noContent()
}
