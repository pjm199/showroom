import { NextRequest, NextResponse } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { buildCollectionPageViewModel } from '@/lib/v2/frontend/view-models'
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

  const collection = await prismaV2.v2Collection.findFirst({
    where: { shopId: shop.id, slug, isActive: true },
    include: {
      heroAsset: true,
      items: {
        orderBy: { sortOrder: 'asc' },
        include: {
          product: {
            where: { displayStatus: { in: ['ACTIVE', 'SEASONAL'] } },
            include: {
              brand: { select: { id: true, name: true, slug: true } },
              media: {
                where: { role: 'COVER' },
                take: 1,
                include: { asset: true },
              },
            },
          },
        },
      },
    },
  })

  if (!collection) return errors.notFound('Collection')

  const viewModel = buildCollectionPageViewModel(collection)
  return NextResponse.json({ data: viewModel })
}
