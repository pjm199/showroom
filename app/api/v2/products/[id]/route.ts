import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'
import { computeReadinessScore } from '@/lib/v2/readiness'

const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  longDescription: z.string().nullable().optional(),
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().max(100).nullable().optional(),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  badges: z.array(z.enum(['NEW', 'FEATURED', 'PROMO', 'LIMITED', 'BESTSELLER', 'SEASONAL'])).optional(),
  highlights: z.array(z.string().max(200)).max(5).optional(),
  presentationNotes: z.string().nullable().optional(),
  priceCents: z.number().int().min(0).nullable().optional(),
  isPurchasable: z.boolean().optional(),
  displayStatus: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'SEASONAL']).optional(),
  sortOrder: z.number().int().optional(),
})

async function getOwnedProduct(shopId: string, id: string) {
  return prismaV2.v2Product.findFirst({
    where: { id, shopId },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      media: { orderBy: [{ role: 'asc' }, { sortOrder: 'asc' }] },
      variants: { orderBy: { sortOrder: 'asc' } },
    },
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:read')
  if (perm) return perm

  const product = await getOwnedProduct(ctx.shopId, id)
  if (!product) return errors.notFound('Product')

  return ok(product)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:write')
  if (perm) return perm

  const product = await prismaV2.v2Product.findFirst({
    where: { id, shopId: ctx.shopId },
    include: { media: { select: { id: true } } },
  })
  if (!product) return errors.notFound('Product')

  const body = await request.json().catch(() => null)
  const parsed = updateProductSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid product data', parsed.error.flatten())
  }

  const data = parsed.data

  if (data.slug && data.slug !== product.slug) {
    const slugConflict = await prismaV2.v2Product.findUnique({
      where: { shopId_slug: { shopId: ctx.shopId, slug: data.slug } },
      select: { id: true },
    })
    if (slugConflict && slugConflict.id !== id) {
      return errors.conflict(`A product with slug '${data.slug}' already exists`)
    }
  }

  const updated = await prismaV2.v2Product.update({
    where: { id },
    data: {
      ...data,
      publicationReadiness: computeReadinessScore({
        title: data.title ?? product.title,
        shortDescription: data.shortDescription !== undefined ? data.shortDescription : product.shortDescription,
        longDescription: data.longDescription !== undefined ? data.longDescription : product.longDescription,
        priceCents: data.priceCents !== undefined ? data.priceCents : product.priceCents,
        isPurchasable: data.isPurchasable !== undefined ? data.isPurchasable : product.isPurchasable,
        categoryId: data.categoryId !== undefined ? data.categoryId : product.categoryId,
        brandId: data.brandId !== undefined ? data.brandId : product.brandId,
        mediaCount: product.media.length,
      }),
    },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      media: { orderBy: [{ role: 'asc' }, { sortOrder: 'asc' }] },
      variants: { orderBy: { sortOrder: 'asc' } },
    },
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

  const product = await prismaV2.v2Product.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!product) return errors.notFound('Product')

  await prismaV2.v2Product.delete({ where: { id } })
  return noContent()
}
