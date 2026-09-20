import { NextRequest, NextResponse } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { buildHomepageViewModel } from '@/lib/v2/frontend/view-models'
import { errors } from '@/lib/v2/response'

export const revalidate = 60

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params

  const shop = await prismaV2.v2Shop.findUnique({
    where: { slug: shopSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      whatsapp: true,
      address: true,
      mapUrl: true,
    },
  })

  if (!shop) return errors.notFound('Shop')

  const homepagePage = await prismaV2.v2Page.findFirst({
    where: { shopId: shop.id, type: 'HOMEPAGE' },
    include: {
      versions: {
        where: { status: 'PUBLISHED' },
        take: 1,
        include: {
          sections: {
            where: { isEnabled: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              sectionType: true,
              bindings: {
                include: {
                  product: {
                    select: {
                      id: true, slug: true, title: true,
                      shortDescription: true, priceCents: true,
                      isPurchasable: true, badges: true,
                      brand: { select: { id: true, name: true, slug: true } },
                      media: {
                        where: { role: 'COVER' },
                        take: 1,
                        include: { asset: true },
                      },
                    },
                  },
                  collection: {
                    select: {
                      id: true, slug: true, name: true, subtitle: true, type: true,
                      heroAsset: true,
                    },
                  },
                  mediaAsset: true,
                },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      },
    },
  })

  const publishedVersion = homepagePage?.versions[0] ?? null
  const viewModel = buildHomepageViewModel(shop, publishedVersion)

  return NextResponse.json({ data: viewModel })
}
