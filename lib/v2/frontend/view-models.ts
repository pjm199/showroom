/**
 * Server-side view model assemblers.
 * Maps V2 DB records into the typed view models consumed by the storefront.
 */

import type {
  HomepageViewModel,
  ProductPageViewModel,
  CollectionPageViewModel,
  ProductCardViewModel,
  MediaViewModel,
  RenderedSection,
  SeoMeta,
  ShopSummary,
} from '@/types/v2'

// ─── Media helpers ────────────────────────────────────────────────────────────

function toMediaViewModel(asset: {
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalPointX: number | null
  focalPointY: number | null
} | null | undefined): MediaViewModel | null {
  if (!asset) return null
  return {
    url: asset.url,
    altText: asset.altText,
    width: asset.width,
    height: asset.height,
    focalPoint:
      asset.focalPointX != null && asset.focalPointY != null
        ? { x: asset.focalPointX, y: asset.focalPointY }
        : null,
  }
}

// ─── Product card ─────────────────────────────────────────────────────────────

function toProductCard(product: {
  id: string
  slug: string
  title: string
  shortDescription: string | null
  priceCents: number | null
  isPurchasable: boolean
  badges: string[]
  brand: { id: string; name: string; slug: string } | null
  media?: Array<{ asset: { url: string; altText: string | null; width: number | null; height: number | null; focalPointX: number | null; focalPointY: number | null } }>
}): ProductCardViewModel {
  const coverAsset = product.media?.[0]?.asset ?? null
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription,
    priceCents: product.priceCents,
    isPurchasable: product.isPurchasable,
    coverMedia: toMediaViewModel(coverAsset),
    badges: product.badges as any,
    brand: product.brand
      ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug }
      : null,
  }
}

// ─── Homepage view model ──────────────────────────────────────────────────────

export function buildHomepageViewModel(
  shop: {
    id: string; name: string; slug: string; description: string | null
    imageUrl: string | null; whatsapp: string | null; address: string | null; mapUrl: string | null
  },
  publishedVersion: {
    sections: Array<{
      id: string
      sectionTypeId: string
      config: unknown
      bindings: Array<{
        slot: string
        bindingType: string
        product?: any
        collection?: any
        mediaAsset?: any
        sortOrder: number
      }>
    }>
  } | null
): HomepageViewModel {
  const shopSummary: ShopSummary = {
    id: shop.id, name: shop.name, slug: shop.slug,
    description: shop.description, imageUrl: shop.imageUrl,
    whatsapp: shop.whatsapp, address: shop.address, mapUrl: shop.mapUrl,
  }

  const sections: RenderedSection[] = (publishedVersion?.sections ?? []).map((section) => {
    const bindings: RenderedSection['bindings'] = {}

    for (const binding of section.bindings.sort((a, b) => a.sortOrder - b.sortOrder)) {
      if (binding.bindingType === 'PRODUCT' && binding.product) {
        const card = toProductCard(binding.product)
        if (!bindings[binding.slot]) bindings[binding.slot] = []
        ;(bindings[binding.slot] as ProductCardViewModel[]).push(card)
      } else if (binding.bindingType === 'COLLECTION' && binding.collection) {
        bindings[binding.slot] = {
          id: binding.collection.id,
          slug: binding.collection.slug,
          name: binding.collection.name,
          subtitle: binding.collection.subtitle,
          type: binding.collection.type,
          heroMedia: toMediaViewModel(binding.collection.heroAsset),
        }
      } else if (binding.bindingType === 'MEDIA_ASSET' && binding.mediaAsset) {
        bindings[binding.slot] = toMediaViewModel(binding.mediaAsset)
      } else if (binding.bindingType === 'MANUAL' && binding.slot) {
        bindings[binding.slot] = {}
      }
    }

    return {
      id: section.id,
      type: section.sectionTypeId,
      config: section.config as Record<string, unknown>,
      bindings,
    }
  })

  const seo: SeoMeta = {
    title: shop.name,
    description: shop.description,
    canonicalUrl: `/${shop.slug}`,
    ogImage: shop.imageUrl,
  }

  return { shop: shopSummary, sections, seo }
}

// ─── Product page view model ──────────────────────────────────────────────────

export function buildProductPageViewModel(product: {
  id: string; slug: string; title: string
  shortDescription: string | null; longDescription: string | null
  priceCents: number | null; isPurchasable: boolean
  badges: string[]; highlights: string[]
  brand: { id: string; name: string; slug: string } | null
  category: {
    id: string; name: string; slug: string
    parent: { id: string; name: string; slug: string } | null
  } | null
  media: Array<{ role: string; asset: { url: string; altText: string | null; width: number | null; height: number | null; focalPointX: number | null; focalPointY: number | null } }>
  variants: Array<{ id: string; label: string; sku: string | null; attributes: unknown; priceCents: number | null; isAvailable: boolean; coverAssetId: string | null }>
}): ProductPageViewModel {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...(product.category?.parent ? [{ label: product.category.parent.name, href: `/c/${product.category.parent.slug}` }] : []),
    ...(product.category ? [{ label: product.category.name, href: `/c/${product.category.slug}` }] : []),
    { label: product.title, href: `/p/${product.slug}` },
  ]

  return {
    product: {
      id: product.id,
      slug: product.slug,
      title: product.title,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      priceCents: product.priceCents,
      isPurchasable: product.isPurchasable,
      badges: product.badges,
      highlights: product.highlights,
      brand: product.brand,
      category: product.category ? { id: product.category.id, name: product.category.name, slug: product.category.slug } : null,
      media: product.media.map((m) => toMediaViewModel(m.asset)).filter(Boolean) as MediaViewModel[],
      variants: product.variants.map((v) => ({
        id: v.id,
        label: v.label,
        sku: v.sku,
        attributes: v.attributes as Record<string, string>,
        priceCents: v.priceCents,
        coverMedia: null,
        isAvailable: v.isAvailable,
      })),
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.shortDescription,
        image: product.media.map((m) => m.asset.url),
        brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : null,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: product.priceCents != null ? product.priceCents / 100 : null,
          availability: product.isPurchasable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    },
    breadcrumbs,
    relatedCollections: [],
    seo: {
      title: product.title,
      description: product.shortDescription,
      canonicalUrl: `/p/${product.slug}`,
      ogImage: product.media[0]?.asset.url ?? null,
    },
  }
}

// ─── Collection page view model ───────────────────────────────────────────────

export function buildCollectionPageViewModel(collection: {
  id: string; slug: string; name: string; subtitle: string | null
  description: string | null; type: string
  heroAsset: { url: string; altText: string | null; width: number | null; height: number | null; focalPointX: number | null; focalPointY: number | null } | null
  startAt: Date | null; endAt: Date | null
  seoTitle: string | null; seoDescription: string | null
  items: Array<{ product: any }>
}): CollectionPageViewModel {
  return {
    collection: {
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      subtitle: collection.subtitle,
      description: collection.description,
      type: collection.type as any,
      heroMedia: toMediaViewModel(collection.heroAsset),
      startAt: collection.startAt?.toISOString() ?? null,
      endAt: collection.endAt?.toISOString() ?? null,
    },
    products: collection.items
      .map((item) => item.product)
      .filter(Boolean)
      .map(toProductCard),
    seo: {
      title: collection.seoTitle ?? collection.name,
      description: collection.seoDescription,
      canonicalUrl: `/collections/${collection.slug}`,
      ogImage: collection.heroAsset?.url ?? null,
    },
  }
}
