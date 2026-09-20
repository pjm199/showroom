import type { ProductCardViewModel, VariantViewModel } from './product'
import type {
  CollectionSummaryViewModel,
  CollectionType,
  BreadcrumbItem,
} from './catalog'
import type { MediaViewModel } from './media'
import type { SeoMeta, RenderedSection } from './composer'
import type { ShopSummary } from './tenant'

export interface CursorPagination {
  nextCursor: string | null
  hasMore: boolean
  total?: number
}

export interface ProductJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Product'
  name: string
  description: string | null
  image: string[]
  brand: { '@type': 'Brand'; name: string } | null
  offers: {
    '@type': 'Offer'
    priceCurrency: string
    price: number | null
    availability: string
  }
}

export interface ProductPageViewModel {
  product: {
    id: string
    slug: string
    title: string
    shortDescription: string | null
    longDescription: string | null
    priceCents: number | null
    isPurchasable: boolean
    badges: string[]
    highlights: string[]
    brand: { id: string; name: string; slug: string } | null
    category: { id: string; name: string; slug: string } | null
    media: MediaViewModel[]
    variants: VariantViewModel[]
    structuredData: ProductJsonLd
  }
  breadcrumbs: BreadcrumbItem[]
  relatedCollections: CollectionSummaryViewModel[]
  seo: SeoMeta
}

export interface CollectionPageViewModel {
  collection: {
    id: string
    slug: string
    name: string
    subtitle: string | null
    description: string | null
    type: CollectionType
    heroMedia: MediaViewModel | null
    startAt: string | null
    endAt: string | null
  }
  products: ProductCardViewModel[]
  seo: SeoMeta
}

export interface CategoryPageViewModel {
  category: {
    id: string
    slug: string
    name: string
    description: string | null
    coverMedia: MediaViewModel | null
    breadcrumbs: BreadcrumbItem[]
  }
  products: ProductCardViewModel[]
  pagination: CursorPagination
  seo: SeoMeta
}

export interface BrandPageViewModel {
  brand: {
    id: string
    slug: string
    name: string
    description: string | null
    logoMedia: MediaViewModel | null
    websiteUrl: string | null
  }
  products: ProductCardViewModel[]
  collections: CollectionSummaryViewModel[]
  pagination: CursorPagination
  seo: SeoMeta
}

export interface HomepageViewModel {
  shop: ShopSummary
  sections: RenderedSection[]
  seo: SeoMeta
}
