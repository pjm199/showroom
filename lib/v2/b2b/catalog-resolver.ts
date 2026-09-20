import { prismaV2 } from '@/lib/prisma-v2'
import type { B2BCatalogProductV2, B2BCatalogViewV2 } from '@/types/v2'

type CatalogWithItems = Awaited<ReturnType<typeof loadCatalog>>

async function loadCatalog(catalogId: string, shopId: string) {
  return prismaV2.v2B2BCatalog.findFirst({
    where: { id: catalogId, shopId, isActive: true },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
        include: {
          product: {
            include: {
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
}

export function resolvePriceCents(
  productId: string,
  productBasePrice: number | null,
  catalogItemPrice: number | null | undefined,
  clientOverrides: Map<string, number>
): number | null {
  const clientPrice = clientOverrides.get(productId)
  if (clientPrice != null) return clientPrice
  if (catalogItemPrice != null) return catalogItemPrice
  return productBasePrice
}

export async function resolveClientCatalog(
  shopId: string,
  clientId: string,
  options?: { isDemo?: boolean }
): Promise<B2BCatalogViewV2 | null> {
  const client = await prismaV2.v2B2BClient.findFirst({
    where: { id: clientId, shopId, isActive: true },
    include: {
      assignedCatalog: true,
    },
  })
  if (!client?.assignedCatalogId) return null

  const catalog = await loadCatalog(client.assignedCatalogId, shopId)
  if (!catalog) return null

  const overrides = options?.isDemo
    ? new Map<string, number>()
    : await loadClientPriceOverrides(clientId)

  return buildCatalogView(catalog, overrides, {
    companyName: client.companyName,
    contactName: client.contactName,
    isDemo: options?.isDemo ?? false,
  })
}

export async function resolveDemoCatalog(
  shopId: string,
  inviteToken: string
): Promise<{ view: B2BCatalogViewV2; inviteId: string } | null> {
  const invite = await prismaV2.v2B2BAccessInvite.findFirst({
    where: {
      shopId,
      token: inviteToken,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
  })
  if (!invite) return null
  if (invite.maxUses != null && invite.useCount >= invite.maxUses) return null

  let catalogId = invite.catalogId
  if (!catalogId && invite.clientId) {
    const client = await prismaV2.v2B2BClient.findFirst({
      where: { id: invite.clientId, shopId },
      select: { assignedCatalogId: true },
    })
    catalogId = client?.assignedCatalogId ?? null
  }
  if (!catalogId) return null

  const catalog = await loadCatalog(catalogId, shopId)
  if (!catalog) return null

  const view = buildCatalogView(catalog, new Map(), { isDemo: true })
  return { view, inviteId: invite.id }
}

async function loadClientPriceOverrides(clientId: string): Promise<Map<string, number>> {
  const rows = await prismaV2.v2B2BClientPriceOverride.findMany({
    where: { clientId },
    select: { productId: true, priceCents: true },
  })
  return new Map(rows.map((r) => [r.productId, r.priceCents]))
}

function buildCatalogView(
  catalog: NonNullable<CatalogWithItems>,
  clientOverrides: Map<string, number>,
  options: {
    companyName?: string
    contactName?: string | null
    isDemo: boolean
  }
): B2BCatalogViewV2 {
  const products: B2BCatalogProductV2[] = catalog.items
    .filter((item) => item.product.displayStatus !== 'ARCHIVED')
    .map((item) => {
      const cover = item.product.media[0]?.asset.url ?? null
      const resolvedPriceCents = resolvePriceCents(
        item.productId,
        item.product.priceCents,
        item.customPriceCents,
        clientOverrides
      )

      return {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        shortDescription: item.product.shortDescription,
        sku: item.product.sku,
        priceCents: item.product.priceCents,
        resolvedPriceCents,
        notes: item.notes,
        coverUrl: cover,
        sortOrder: item.sortOrder,
      }
    })

  return {
    catalog: {
      id: catalog.id,
      name: catalog.name,
      slug: catalog.slug,
      description: catalog.description,
      notes: catalog.notes,
      requestOrderEnabled: catalog.requestOrderEnabled,
    },
    products,
    client: options.companyName
      ? { companyName: options.companyName, contactName: options.contactName ?? null }
      : undefined,
    isDemo: options.isDemo,
  }
}

export async function resolveOrderItems(
  shopId: string,
  catalogId: string,
  clientId: string | null,
  items: { productId: string; quantity: number; notes?: string }[],
  isDemo: boolean
) {
  const catalog = await loadCatalog(catalogId, shopId)
  if (!catalog) return null

  const overrides =
    clientId && !isDemo ? await loadClientPriceOverrides(clientId) : new Map<string, number>()

  const catalogItemMap = new Map(catalog.items.map((i) => [i.productId, i]))

  const resolved = []
  for (const item of items) {
    const catalogItem = catalogItemMap.get(item.productId)
    if (!catalogItem) return null

    const priceCents = resolvePriceCents(
      item.productId,
      catalogItem.product.priceCents,
      catalogItem.customPriceCents,
      overrides
    )

    resolved.push({
      productId: item.productId,
      title: catalogItem.product.title,
      quantity: item.quantity,
      priceCents,
      notes: item.notes,
    })
  }

  return resolved
}
