# Vetrina V2 — API Contract

This document defines the API surfaces for Vetrina V2. Three distinct surfaces exist and must not be blended: the **Vetrina-facing API** (dashboard operations), the **frontend-facing API** (storefront rendering), and the **HUB-facing API** (orchestration integration, FULL mode only).

All endpoints are prefixed `/api/v2/`. V1 endpoints under `/api/shops/` remain frozen and unaffected.

---

## General Conventions

- **Authentication:** All Vetrina-facing and HUB-facing endpoints require a valid session (NextAuth JWT). Frontend-facing endpoints are public but scoped to a shop via slug or id.
- **Tenant scoping:** Every query is implicitly scoped to the authenticated user's `shopId`. No cross-tenant data access is possible.
- **Response envelope:** Consistent shape for all responses.

```
// Success
{ "data": <payload>, "meta"?: { pagination } }

// Error
{ "error": { "code": string, "message": string, "details"?: any } }
```

- **Pagination:** Cursor-based pagination for list endpoints. `?cursor=<id>&limit=<n>` (default limit: 20, max: 100).
- **Validation:** All request bodies validated with Zod on the server. Invalid payloads return 400 with field-level errors.
- **Idempotency:** Write operations that may be retried should include `Idempotency-Key` header (enforced for publication actions).

---

## 1. Vetrina-Facing API (Dashboard)

These endpoints are consumed by the Vetrina dashboard UI and optimized for editing, authoring, and publishing operations.

### 1.1 Products

```
GET    /api/v2/products
       ?cursor, limit, categoryId, brandId, displayStatus, search, tags
       → ProductListResponse

GET    /api/v2/products/:id
       → ProductDetailResponse

POST   /api/v2/products
       body: CreateProductInput
       → ProductDetailResponse

PATCH  /api/v2/products/:id
       body: UpdateProductInput
       → ProductDetailResponse

DELETE /api/v2/products/:id
       → 204

POST   /api/v2/products/:id/duplicate
       → ProductDetailResponse

POST   /api/v2/products/:id/archive
       → ProductDetailResponse
```

**CreateProductInput**
```typescript
{
  title: string
  shortDescription?: string
  longDescription?: string
  slug?: string          // auto-generated from title if omitted
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
```

**UpdateProductInput** — all fields optional (PATCH semantics).

**ProductDetailResponse** — full product including computed `publicationReadiness`, associated `ProductMedia[]`, `ProductVariantView[]`, and current `PublicationIntent[]` per target.

---

### 1.2 Product Variants

```
GET    /api/v2/products/:id/variants
       → ProductVariantView[]

POST   /api/v2/products/:id/variants
       body: CreateVariantInput
       → ProductVariantView

PATCH  /api/v2/products/:id/variants/:variantId
       body: UpdateVariantInput
       → ProductVariantView

DELETE /api/v2/products/:id/variants/:variantId
       → 204
```

---

### 1.3 Product Media

```
GET    /api/v2/products/:id/media
       → ProductMedia[]

POST   /api/v2/products/:id/media
       body: { assetId: string, role: MediaRole, sortOrder?: number, altText?: string }
       → ProductMedia

PATCH  /api/v2/products/:id/media/:mediaId
       body: { role?, sortOrder?, altText? }
       → ProductMedia

DELETE /api/v2/products/:id/media/:mediaId
       → 204

POST   /api/v2/products/:id/media/reorder
       body: { orderedIds: string[] }
       → ProductMedia[]
```

---

### 1.4 Brands

```
GET    /api/v2/brands
       ?cursor, limit, search
       → Brand[]

POST   /api/v2/brands
       body: { name, slug?, description?, logoAssetId? }
       → Brand

PATCH  /api/v2/brands/:id
       → Brand

DELETE /api/v2/brands/:id
       → 204
```

---

### 1.5 Categories

```
GET    /api/v2/categories
       ?parentId (omit for root level)
       → Category[]

POST   /api/v2/categories
       body: { name, slug?, parentId?, description?, coverAssetId?, sortOrder? }
       → Category

PATCH  /api/v2/categories/:id
       → Category

DELETE /api/v2/categories/:id
       → 204

POST   /api/v2/categories/reorder
       body: { orderedIds: string[] }
       → Category[]
```

---

### 1.6 Collections

```
GET    /api/v2/collections
       ?cursor, limit, type, isActive
       → CollectionListResponse

GET    /api/v2/collections/:id
       → CollectionDetailResponse (with items)

POST   /api/v2/collections
       body: CreateCollectionInput
       → CollectionDetailResponse

PATCH  /api/v2/collections/:id
       → CollectionDetailResponse

DELETE /api/v2/collections/:id
       → 204

POST   /api/v2/collections/:id/items
       body: { productId: string, sortOrder?: number }
       → CollectionItem

DELETE /api/v2/collections/:id/items/:productId
       → 204

POST   /api/v2/collections/:id/items/reorder
       body: { orderedProductIds: string[] }
       → CollectionItem[]
```

---

### 1.7 Publication

```
GET    /api/v2/publication/intents
       ?entityType, entityId, targetId, status
       → PublicationIntent[]

POST   /api/v2/publication/intents
       body: CreatePublicationIntentInput
       → PublicationIntent

PATCH  /api/v2/publication/intents/:id
       body: { status?, scheduledAt?, expiresAt?, audienceRuleId? }
       → PublicationIntent

POST   /api/v2/publication/intents/:id/publish
       → PublicationIntent

POST   /api/v2/publication/intents/:id/unpublish
       → PublicationIntent

POST   /api/v2/publication/intents/:id/cancel-schedule
       → PublicationIntent

GET    /api/v2/publication/targets
       → PublicationTarget[]

POST   /api/v2/publication/targets
       body: { type, name, channelRef? }
       → PublicationTarget

GET    /api/v2/publication/audience-rules
       → AudienceRule[]

POST   /api/v2/publication/audience-rules
       body: { name, type, segmentIds?, accessToken? }
       → AudienceRule
```

**CreatePublicationIntentInput**
```typescript
{
  entityType: 'PRODUCT' | 'COLLECTION' | 'PAGE'
  entityId: string
  targetId: string
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
  scheduledAt?: string    // ISO 8601
  expiresAt?: string      // ISO 8601
  audienceRuleId?: string
}
```

---

### 1.8 Media Library

```
GET    /api/v2/media
       ?cursor, limit, tags, mimeType, search
       → MediaAsset[]

GET    /api/v2/media/:id
       → MediaAsset

POST   /api/v2/media
       body: UploadMediaInput (multipart/form-data or signed URL flow)
       → MediaAsset

PATCH  /api/v2/media/:id
       body: { altText?, focalPointX?, focalPointY?, tags? }
       → MediaAsset

DELETE /api/v2/media/:id
       → 204 or 409 (if asset is in use and forceDelete not passed)
```

---

### 1.9 B2B Catalogs

```
GET    /api/v2/b2b/catalogs
       ?cursor, limit, isActive
       → B2BCatalog[]

GET    /api/v2/b2b/catalogs/:id
       → B2BCatalogDetail (with items)

POST   /api/v2/b2b/catalogs
       body: CreateB2BCatalogInput
       → B2BCatalogDetail

PATCH  /api/v2/b2b/catalogs/:id
       → B2BCatalogDetail

DELETE /api/v2/b2b/catalogs/:id
       → 204

POST   /api/v2/b2b/catalogs/:id/items
       body: { productId, sortOrder?, notes?, customPriceCents? }
       → B2BCatalogItem

PATCH  /api/v2/b2b/catalogs/:id/items/:itemId
       body: { sortOrder?, notes?, customPriceCents? }
       → B2BCatalogItem

DELETE /api/v2/b2b/catalogs/:id/items/:itemId
       → 204

POST   /api/v2/b2b/catalogs/:id/items/reorder
       body: { orderedProductIds: string[] }
       → B2BCatalogItem[]
```

---

### 1.10 Site Composer — Pages

```
GET    /api/v2/composer/pages
       ?type
       → Page[]

GET    /api/v2/composer/pages/:id
       → PageDetail (with current draft PageVersion and its sections)

POST   /api/v2/composer/pages
       body: { type, slug, title, seoTitle?, seoDescription?, canonicalRef? }
       → PageDetail

PATCH  /api/v2/composer/pages/:id
       body: { title?, seoTitle?, seoDescription? }
       → PageDetail

DELETE /api/v2/composer/pages/:id
       → 204
```

---

### 1.11 Site Composer — Page Versions

```
GET    /api/v2/composer/pages/:pageId/versions
       → PageVersion[]

GET    /api/v2/composer/pages/:pageId/versions/:versionId
       → PageVersionDetail (with SectionInstances and SectionBindings)

POST   /api/v2/composer/pages/:pageId/versions
       body: { label?, cloneFromVersionId? }
       → PageVersionDetail (new DRAFT version)

POST   /api/v2/composer/pages/:pageId/versions/:versionId/publish
       → PageVersionDetail (status → PUBLISHED, previous PUBLISHED → ARCHIVED)

POST   /api/v2/composer/pages/:pageId/versions/:versionId/preview
       → PreviewSnapshot (with preview URL)

POST   /api/v2/composer/pages/:pageId/versions/:versionId/rollback
       → PageVersionDetail (creates new DRAFT from this archived version)
```

---

### 1.12 Site Composer — Sections

```
GET    /api/v2/composer/section-types
       → SectionType[]

POST   /api/v2/composer/versions/:versionId/sections
       body: { sectionTypeId, label?, config?, sortOrder?, isEnabled? }
       → SectionInstance

PATCH  /api/v2/composer/versions/:versionId/sections/:sectionId
       body: { label?, config?, isEnabled?, sortOrder?, audienceRuleId? }
       → SectionInstance

DELETE /api/v2/composer/versions/:versionId/sections/:sectionId
       → 204

POST   /api/v2/composer/versions/:versionId/sections/reorder
       body: { orderedIds: string[] }
       → SectionInstance[]

POST   /api/v2/composer/versions/:versionId/sections/:sectionId/bindings
       body: { slot, bindingType, refId?, manualValue?, sortOrder? }
       → SectionBinding

DELETE /api/v2/composer/versions/:versionId/sections/:sectionId/bindings/:bindingId
       → 204

POST   /api/v2/composer/versions/:versionId/sections/:sectionId/bindings/reorder
       body: { slot, orderedIds: string[] }
       → SectionBinding[]
```

---

### 1.13 Audit and Publish History

```
GET    /api/v2/audit/events
       ?entityType, entityId, cursor, limit
       → PublishEvent[]

GET    /api/v2/audit/release-records
       ?pageId, cursor, limit
       → ReleaseRecord[]
```

---

## 2. Frontend-Facing API (Storefront)

These endpoints are consumed by the standalone storefront app. They are public (no auth required), scoped to a shop by `slug`, and optimized for server-side rendering. They return pre-shaped view models that include only what is needed for rendering.

All frontend API responses are cacheable and designed for on-demand ISR invalidation.

### 2.1 Homepage

```
GET    /api/v2/frontend/:shopSlug/homepage
       → HomepageViewModel
```

**HomepageViewModel**
```typescript
{
  shop: ShopSummary
  sections: RenderedSection[]   // ordered list of active sections for the PUBLISHED homepage version
  seo: SeoMeta
}
```

Where `RenderedSection` is typed per section type:
```typescript
{
  id: string
  type: SectionTypeId       // 'hero' | 'carousel' | 'featured-grid' | 'promo-banner' | 'collection-highlight'
  config: Record<string, unknown>
  bindings: {
    [slot: string]: ProductCardViewModel[] | CollectionSummaryViewModel | MediaViewModel | null
  }
}
```

---

### 2.2 Product Detail Page

```
GET    /api/v2/frontend/:shopSlug/products/:slug
       → ProductPageViewModel
```

**ProductPageViewModel**
```typescript
{
  product: {
    id: string
    slug: string
    title: string
    shortDescription: string | null
    longDescription: string | null
    priceCents: number | null
    isPurchasable: boolean
    badges: ProductBadge[]
    highlights: string[]
    brand: BrandSummary | null
    category: CategorySummary | null
    media: MediaViewModel[]         // ordered, role-annotated
    variants: VariantViewModel[]
    structuredData: ProductJsonLd   // JSON-LD Product schema
  }
  breadcrumbs: BreadcrumbItem[]
  relatedCollections: CollectionSummaryViewModel[]
  seo: SeoMeta
}
```

---

### 2.3 Collection Page

```
GET    /api/v2/frontend/:shopSlug/collections/:slug
       → CollectionPageViewModel
```

**CollectionPageViewModel**
```typescript
{
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
```

---

### 2.4 Category Page

```
GET    /api/v2/frontend/:shopSlug/categories/:slug
       ?cursor, limit
       → CategoryPageViewModel
```

**CategoryPageViewModel**
```typescript
{
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
```

---

### 2.5 Brand Page

```
GET    /api/v2/frontend/:shopSlug/brands/:slug
       ?cursor, limit
       → BrandPageViewModel
```

---

### 2.6 Shop Info

```
GET    /api/v2/frontend/:shopSlug/shop
       → ShopSummary (name, description, logo, whatsapp, address, mapUrl)
```

---

### 2.7 Shared View Model Types

**ProductCardViewModel** — used in listings, carousels, grids
```typescript
{
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
```

**MediaViewModel**
```typescript
{
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalPoint: { x: number; y: number } | null
}
```

**SeoMeta**
```typescript
{
  title: string
  description: string | null
  canonicalUrl: string
  ogImage: string | null
}
```

---

### 2.8 Cache Invalidation Webhook

```
POST   /api/v2/frontend/revalidate
       headers: { Authorization: Bearer <REVALIDATION_SECRET> }
       body: { paths: string[] }
       → { revalidated: string[], errors: string[] }
```

This endpoint is called by Vetrina (or HUB in FULL mode) when a publish event occurs to trigger on-demand revalidation of affected storefront routes.

---

## 3. HUB-Facing API (FULL Mode Only)

These endpoints are consumed by the HUB orchestrator in FULL mode deployments. They are not exposed in BASE mode. Authentication uses a service-to-service API key.

### 3.1 Publication Sync Callbacks

```
POST   /api/v2/hub/publication/sync-result
       body: {
         intentId: string
         syncStatus: 'SYNCED' | 'FAILED'
         syncError?: string
         channelRef?: string   // external ID assigned by the channel
       }
       → 200
```

HUB calls this endpoint after executing a channel publication job to update `PublicationIntent.syncStatus` in Vetrina.

### 3.2 Product Reads (HUB catalog pull)

```
GET    /api/v2/hub/products
       ?shopId, cursor, limit, updatedAfter
       → Product[] (full internal representation, not view model)

GET    /api/v2/hub/products/:id
       → Product (full)
```

HUB uses these to read products that have `publishIntents` with `status = PUBLISHED` and `syncStatus = PENDING`, then execute the channel sync job.

### 3.3 Page Publication Events

```
POST   /api/v2/hub/pages/published
       body: { pageId: string, pageVersionId: string, shopId: string }
       → 200
```

HUB notifies Vetrina (or vice versa depending on deployment topology) when a page version goes live, triggering storefront cache invalidation.

---

## 4. Error Codes Reference

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Valid session but insufficient role |
| `NOT_FOUND` | 404 | Entity not found or not in tenant scope |
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `CONFLICT` | 409 | Unique constraint or state conflict |
| `ALREADY_PUBLISHED` | 409 | Publication intent already in PUBLISHED state |
| `INTENT_NOT_FOUND` | 404 | Publication intent not found for entity/target pair |
| `MEDIA_IN_USE` | 409 | Cannot delete media asset that is actively bound |
| `VERSION_NOT_DRAFT` | 409 | Cannot edit a PageVersion that is not in DRAFT state |
| `PUBLISHED_VERSION_EXISTS` | 409 | Cannot publish when another version is already PUBLISHED (use rollback) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
