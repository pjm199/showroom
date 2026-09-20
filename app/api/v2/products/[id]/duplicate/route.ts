import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { created, errors } from '@/lib/v2/response'
import { generateSlug } from '@/lib/v2/slug'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:write')
  if (perm) return perm

  const source = await prismaV2.v2Product.findFirst({
    where: { id, shopId: ctx.shopId },
  })
  if (!source) return errors.notFound('Product')

  const baseSlug = generateSlug(`${source.title}-copy`)
  let slug = baseSlug
  let attempt = 1
  while (
    await prismaV2.v2Product.findUnique({
      where: { shopId_slug: { shopId: ctx.shopId, slug } },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${++attempt}`
  }

  const copy = await prismaV2.v2Product.create({
    data: {
      shopId: ctx.shopId,
      title: `${source.title} (copy)`,
      shortDescription: source.shortDescription,
      longDescription: source.longDescription,
      slug,
      sku: source.sku ? `${source.sku}-copy` : null,
      brandId: source.brandId,
      categoryId: source.categoryId,
      tags: source.tags,
      badges: source.badges,
      highlights: source.highlights,
      presentationNotes: source.presentationNotes,
      priceCents: source.priceCents,
      isPurchasable: source.isPurchasable,
      displayStatus: 'DRAFT',
      publicationReadiness: 0,
    },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      media: true,
      variants: true,
    },
  })

  return created(copy)
}
