import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

const updateCatalogSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  coverAssetId: z.string().nullable().optional(),
  audienceRuleId: z.string().nullable().optional(),
  priceListRef: z.string().nullable().optional(),
  requestOrderEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  clientId: z.string().nullable().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const catalog = await prismaV2.v2B2BCatalog.findFirst({
    where: { id, shopId: ctx.shopId },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, slug: true, displayStatus: true, priceCents: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
      audienceRule: true,
    },
  })
  if (!catalog) return errors.notFound('B2B catalog')

  return ok(catalog)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const catalog = await prismaV2.v2B2BCatalog.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!catalog) return errors.notFound('B2B catalog')

  const body = await request.json().catch(() => null)
  const parsed = updateCatalogSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid catalog data', parsed.error.flatten())
  }

  const updated = await prismaV2.v2B2BCatalog.update({
    where: { id },
    data: parsed.data,
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

  const perm = requirePermission(ctx.role, 'b2b:delete')
  if (perm) return perm

  const catalog = await prismaV2.v2B2BCatalog.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!catalog) return errors.notFound('B2B catalog')

  await prismaV2.v2B2BCatalog.delete({ where: { id } })
  return noContent()
}
