import { NextRequest, NextResponse } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { buildProductPageViewModel } from '@/lib/v2/frontend/view-models'
import { errors } from '@/lib/v2/response'

export const revalidate = 120

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string; slug: string }> }
) {
  const { shopSlug, slug } = await params

  const shop = await prismaV2.v2Shop.findUnique({
    where: { slug: shopSlug },
    select: { id: true },
  })
  if (!shop) return errors.notFound('Shop')

  const product = await prismaV2.v2Product.findFirst({
    where: {
      shopId: shop.id,
      slug,
      displayStatus: { in: ['ACTIVE', 'SEASONAL'] },
    },
    include: {
      brand: true,
      category: { include: { parent: true } },
      media: {
        orderBy: [{ role: 'asc' }, { sortOrder: 'asc' }],
        include: { asset: true },
      },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!product) return errors.notFound('Product')

  // Check it has a live publication intent for storefront
  const intent = await prismaV2.v2PublicationIntent.findFirst({
    where: {
      entityType: 'PRODUCT',
      entityId: product.id,
      status: 'PUBLISHED',
      target: { type: 'STOREFRONT' },
    },
  })

  if (!intent) return errors.notFound('Product')

  const viewModel = buildProductPageViewModel(product)

  return NextResponse.json({ data: viewModel })
}
