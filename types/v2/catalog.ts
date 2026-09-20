export interface BrandV2 {
  id: string
  shopId: string
  name: string
  slug: string
  description: string | null
  logoAssetId: string | null
  websiteUrl: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface BrandSummary {
  id: string
  name: string
  slug: string
}

export interface CategoryV2 {
  id: string
  shopId: string
  parentId: string | null
  name: string
  slug: string
  description: string | null
  coverAssetId: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CategorySummary {
  id: string
  name: string
  slug: string
  parentId: string | null
}

export type CollectionType =
  | 'SEASONAL'
  | 'PROMO'
  | 'EDITORIAL'
  | 'LAUNCH'
  | 'OUTLET'
  | 'B2B'

export interface CollectionV2 {
  id: string
  shopId: string
  name: string
  slug: string
  subtitle: string | null
  description: string | null
  type: CollectionType
  heroAssetId: string | null
  startAt: string | null
  endAt: string | null
  seoTitle: string | null
  seoDescription: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CollectionDetailV2 extends CollectionV2 {
  items: CollectionItemV2[]
}

export interface CollectionItemV2 {
  id: string
  collectionId: string
  productId: string
  sortOrder: number
  createdAt: string
}

export interface CollectionSummaryViewModel {
  id: string
  slug: string
  name: string
  subtitle: string | null
  type: CollectionType
  heroMedia: import('./media').MediaViewModel | null
}

export interface BreadcrumbItem {
  label: string
  href: string
}

export interface CreateCollectionInput {
  name: string
  slug?: string
  subtitle?: string
  description?: string
  type: CollectionType
  heroAssetId?: string
  startAt?: string
  endAt?: string
  seoTitle?: string
  seoDescription?: string
}

export type UpdateCollectionInput = Partial<CreateCollectionInput>
