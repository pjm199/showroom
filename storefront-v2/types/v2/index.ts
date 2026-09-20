// Re-export V2 types for use in the storefront.
// Keep in sync with the main app's types/v2/.
// In a monorepo setup, these would be shared via a package.

export type ProductBadge =
  | 'NEW' | 'FEATURED' | 'PROMO' | 'LIMITED' | 'BESTSELLER' | 'SEASONAL'

export type CollectionType =
  | 'SEASONAL' | 'PROMO' | 'EDITORIAL' | 'LAUNCH' | 'OUTLET' | 'B2B'

export interface MediaViewModel {
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalPoint: { x: number; y: number } | null
}

export interface BrandSummary {
  id: string; name: string; slug: string
}

export interface ProductCardViewModel {
  id: string
  slug: string
  title: string
  shortDescription: string | null
  priceCents: number | null
  isPurchasable: boolean
  coverMedia: MediaViewModel | null
  badges: ProductBadge[]
  brand: BrandSummary | null
}

export interface CollectionSummaryViewModel {
  id: string
  slug: string
  name: string
  subtitle: string | null
  type: CollectionType
  heroMedia: MediaViewModel | null
}

export interface ShopSummary {
  id: string; name: string; slug: string
  description: string | null; imageUrl: string | null
  whatsapp: string | null; address: string | null; mapUrl: string | null
}

export interface SeoMeta {
  title: string
  description: string | null
  canonicalUrl: string
  ogImage: string | null
}

export interface RenderedSectionBindings {
  [slot: string]:
    | ProductCardViewModel[]
    | CollectionSummaryViewModel
    | MediaViewModel
    | Record<string, unknown>
    | null
}

export interface RenderedSection {
  id: string
  type: string
  config: Record<string, unknown>
  bindings: RenderedSectionBindings
}

export interface HomepageViewModel {
  shop: ShopSummary
  sections: RenderedSection[]
  seo: SeoMeta
}

export interface BreadcrumbItem {
  label: string; href: string
}

export interface VariantViewModel {
  id: string; label: string; sku: string | null
  attributes: Record<string, string>; priceCents: number | null
  coverMedia: MediaViewModel | null; isAvailable: boolean
}

export interface ProductJsonLd {
  '@context': 'https://schema.org'; '@type': 'Product'
  name: string; description: string | null; image: string[]
  brand: { '@type': 'Brand'; name: string } | null
  offers: { '@type': 'Offer'; priceCurrency: string; price: number | null; availability: string }
}

export interface ProductPageViewModel {
  product: {
    id: string; slug: string; title: string
    shortDescription: string | null; longDescription: string | null
    priceCents: number | null; isPurchasable: boolean
    badges: string[]; highlights: string[]
    brand: { id: string; name: string; slug: string } | null
    category: { id: string; name: string; slug: string } | null
    media: MediaViewModel[]; variants: VariantViewModel[]
    structuredData: ProductJsonLd
  }
  breadcrumbs: BreadcrumbItem[]
  relatedCollections: CollectionSummaryViewModel[]
  seo: SeoMeta
}

export interface CollectionPageViewModel {
  collection: {
    id: string; slug: string; name: string; subtitle: string | null
    description: string | null; type: CollectionType
    heroMedia: MediaViewModel | null; startAt: string | null; endAt: string | null
  }
  products: ProductCardViewModel[]
  seo: SeoMeta
}

export interface B2BCatalogProductV2 {
  id: string
  title: string
  slug: string
  shortDescription: string | null
  sku: string | null
  priceCents: number | null
  resolvedPriceCents: number | null
  notes: string | null
  coverUrl: string | null
  sortOrder: number
}

export interface B2BCatalogViewV2 {
  catalog: {
    id: string
    name: string
    slug: string
    description: string | null
    notes: string | null
    requestOrderEnabled: boolean
  }
  products: B2BCatalogProductV2[]
  client?: { companyName: string; contactName: string | null } | null
  isDemo: boolean
}
