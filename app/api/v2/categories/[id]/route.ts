import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  parentId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  coverAssetId: z.string().nullable().optional(),
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

  const category = await prismaV2.v2Category.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true, slug: true },
  })
  if (!category) return errors.notFound('Category')

  const body = await request.json().catch(() => null)
  const parsed = updateCategorySchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid category data', parsed.error.flatten())
  }

  const data = parsed.data

  if (data.slug && data.slug !== category.slug) {
    const conflict = await prismaV2.v2Category.findUnique({
      where: { shopId_slug: { shopId: ctx.shopId, slug: data.slug } },
      select: { id: true },
    })
    if (conflict && conflict.id !== id) {
      return errors.conflict(`A category with slug '${data.slug}' already exists`)
    }
  }

  const updated = await prismaV2.v2Category.update({
    where: { id },
    data,
    include: { children: { orderBy: { sortOrder: 'asc' } } },
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

  const perm = requirePermission(ctx.role, 'products:delete')
  if (perm) return perm

  const category = await prismaV2.v2Category.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!category) return errors.notFound('Category')

  await prismaV2.v2Category.delete({ where: { id } })
  return noContent()
}
