import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

const updateBrandSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  logoAssetId: z.string().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:write')
  if (perm) return perm

  const brand = await prismaV2.v2Brand.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true, slug: true },
  })
  if (!brand) return errors.notFound('Brand')

  const body = await request.json().catch(() => null)
  const parsed = updateBrandSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid brand data', parsed.error.flatten())
  }

  const data = parsed.data

  if (data.slug && data.slug !== brand.slug) {
    const conflict = await prismaV2.v2Brand.findUnique({
      where: { shopId_slug: { shopId: ctx.shopId, slug: data.slug } },
      select: { id: true },
    })
    if (conflict && conflict.id !== id) {
      return errors.conflict(`A brand with slug '${data.slug}' already exists`)
    }
  }

  const updated = await prismaV2.v2Brand.update({ where: { id }, data })
  return ok(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:delete')
  if (perm) return perm

  const brand = await prismaV2.v2Brand.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!brand) return errors.notFound('Brand')

  await prismaV2.v2Brand.delete({ where: { id } })
  return noContent()
}
