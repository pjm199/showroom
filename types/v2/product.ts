import type { BrandSummary, CategorySummary } from './catalog'
import type { MediaViewModel } from './media'

export type ProductBadge =
  | 'NEW'
  | 'FEATURED'
  | 'PROMO'
  | 'LIMITED'
  | 'BESTSELLER'
  | 'SEASONAL'

export type ProductDisplayStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED'
  | 'SEASONAL'

export type MediaRole = 'COVER' | 'GALLERY' | 'HERO' | 'THUMBNAIL'

export interface ProductV2 {
  id: string
  shopId: string
  title: string
  shortDescription: string | null
  longDescription: string | null
  slug: string
  sku: string | null
  brandId: string | null
  categoryId: string | null
  tags: string[]
  badges: ProductBadge[]
  highlights: string[]
  presentationNotes: string | null
  priceCents: number | null
  isPurchasable: boolean
  displayStatus: ProductDisplayStatus
  publicationReadiness: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProductDetailV2 extends ProductV2 {
  brand: BrandSummary | null
  category: CategorySummary | null
  media: ProductMediaV2[]
  variants: ProductVariantViewV2[]
}

export interface ProductMediaV2 {
  id: string
  productId: string
  assetId: string
  role: MediaRole
  sortOrder: number
  altText: string | null
  createdAt: string
}

export interface ProductVariantViewV2 {
  id: string
  productId: string
  label: string
  sku: string | null
  attributes: Record<string, string>
  priceCents: number | null
  coverAssetId: string | null
  sortOrder: number
  isAvailable: boolean
  createdAt: string
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

export interface VariantViewModel {
  id: string
  label: string
  sku: string | null
  attributes: Record<string, string>
  priceCents: number | null
  coverMedia: MediaViewModel | null
  isAvailable: boolean
}

export interface CreateProductInput {
  title: string
  shortDescription?: string
  longDescription?: string
  slug?: string
  sku?: string
  brandId?: string
  categoryId?: string
  tags?: string[]
  badges?: ProductBadge[]
  highlights?: string[]
  presentationNotes?: string
  priceCents?: number
  isPurchasable?: boolean
  displayStatus?: ProductDisplayStatus
}

export type UpdateProductInput = Partial<CreateProductInput>
