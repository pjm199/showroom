import type { ProductCardViewModel } from './product'
import type { CollectionSummaryViewModel } from './catalog'
import type { MediaViewModel } from './media'

export type PageType =
  | 'HOMEPAGE'
  | 'CATEGORY'
  | 'COLLECTION'
  | 'LANDING'
  | 'BRAND'

export interface PageV2 {
  id: string
  shopId: string
  type: PageType
  slug: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  canonicalRef: string | null
  createdAt: string
  updatedAt: string
}

export interface PageDetailV2 extends PageV2 {
  currentDraft: PageVersionDetailV2 | null
  publishedVersion: PageVersionDetailV2 | null
}

export type PageVersionStatus = 'DRAFT' | 'PREVIEW' | 'PUBLISHED' | 'ARCHIVED'

export interface PageVersionV2 {
  id: string
  pageId: string
  status: PageVersionStatus
  label: string | null
  publishedAt: string | null
  archivedAt: string | null
  createdBy: string
  createdAt: string
}

export interface PageVersionDetailV2 extends PageVersionV2 {
  sections: SectionInstanceDetailV2[]
}

export type SectionTypeId =
  | 'hero'
  | 'carousel'
  | 'featured-grid'
  | 'promo-banner'
  | 'collection-highlight'

export type BindingType = 'PRODUCT' | 'COLLECTION' | 'MEDIA_ASSET' | 'MANUAL'

export interface SectionTypeV2 {
  id: SectionTypeId | string
  name: string
  description: string | null
  configSchema: Record<string, unknown>
  allowedBindings: BindingType[]
  isActive: boolean
}

export interface SectionInstanceV2 {
  id: string
  pageVersionId: string
  sectionTypeId: string
  label: string | null
  config: Record<string, unknown>
  isEnabled: boolean
  sortOrder: number
  audienceRuleId: string | null
  createdAt: string
  updatedAt: string
}

export interface SectionBindingV2 {
  id: string
  sectionInstanceId: string
  slot: string
  bindingType: BindingType
  refId: string | null
  manualValue: Record<string, unknown> | null
  sortOrder: number
  createdAt: string
}

export interface SectionInstanceDetailV2 extends SectionInstanceV2 {
  bindings: SectionBindingV2[]
}

export interface SectionVariantV2 {
  id: string
  sectionInstanceId: string
  variantKey: string
  config: Record<string, unknown>
  isActive: boolean
  createdAt: string
}

export interface PreviewSnapshotV2 {
  id: string
  pageVersionId: string
  token: string
  previewUrl: string
  expiresAt: string
  createdAt: string
}

export type PublishEventAction =
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'SCHEDULE'
  | 'CANCEL_SCHEDULE'
  | 'ROLLBACK'

export type PublishEventEntityType =
  | 'PRODUCT'
  | 'PAGE'
  | 'COLLECTION'
  | 'B2B_CATALOG'

export interface PublishEventV2 {
  id: string
  shopId: string
  entityType: PublishEventEntityType
  entityId: string
  action: PublishEventAction
  targetId: string | null
  actorId: string
  occurredAt: string
  meta: Record<string, unknown> | null
}

export interface ReleaseRecordV2 {
  id: string
  pageId: string
  pageVersionId: string
  publishedAt: string
  publishedBy: string
  rollbackFrom: string | null
}

export interface CreateSectionInstanceInput {
  sectionTypeId: string
  label?: string
  config?: Record<string, unknown>
  sortOrder?: number
  isEnabled?: boolean
}

export interface UpdateSectionInstanceInput {
  label?: string
  config?: Record<string, unknown>
  isEnabled?: boolean
  sortOrder?: number
  audienceRuleId?: string | null
}

export interface CreateSectionBindingInput {
  slot: string
  bindingType: BindingType
  refId?: string
  manualValue?: Record<string, unknown>
  sortOrder?: number
}

// ─── Storefront view models ──────────────────────────────────────────────────

export interface RenderedSectionBinding {
  [slot: string]:
    | ProductCardViewModel[]
    | CollectionSummaryViewModel
    | MediaViewModel
    | Record<string, unknown>
    | null
}

export interface RenderedSection {
  id: string
  type: SectionTypeId | string
  config: Record<string, unknown>
  bindings: RenderedSectionBinding
}

export interface SeoMeta {
  title: string
  description: string | null
  canonicalUrl: string
  ogImage: string | null
}

export interface HomepageViewModel {
  shop: import('./tenant').ShopSummary
  sections: RenderedSection[]
  seo: SeoMeta
}
