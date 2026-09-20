# Vetrina V2 — Domain Data Model

This document defines all entities, fields, relations, and domain ownership for Vetrina V2. It is the canonical reference before schema or code work begins. Every entity belongs to exactly one domain. No entity may have responsibilities in two domains simultaneously.

---

## Domain Overview

| Domain | Entities | Owns | Must not own |
|---|---|---|---|
| Tenant | Shop, User | identity, configuration, subscription mode | cross-system workflow |
| Product Authoring | Product, ProductVariantView, ProductMedia, Brand, Category | commercial content, display enrichment, readiness | sync execution, fiscal data |
| Publication | PublicationTarget, PublicationIntent, AudienceRule, Collection, CollectionItem | publication intent, placement, scheduling, visibility | channel adapter execution |
| Site Composer | Page, PageVersion, SectionType, SectionInstance, SectionBinding, SectionVariant | page/section structure, layout composition | raw HTML, free-form editing |
| Media | MediaAsset | assets, metadata, focal points | CDN delivery, image processing |
| B2B Catalog | B2BCatalog, B2BCatalogItem | B2B catalog composition, segment visibility | order workflow, pricing engine |
| Preview & Release | PreviewSnapshot, PublishEvent, ReleaseRecord | safe publishing, history, rollback | runtime rendering |

---

## 1. Tenant Domain

### Shop

The top-level tenant entity. One shop = one merchant account.

| Field | Type | Notes |
|---|---|---|
| id | cuid | primary key |
| name | string | display name |
| slug | string unique | used in storefront URLs |
| description | string? | short merchant description |
| imageUrl | string? | shop logo/cover |
| whatsapp | string? | contact channel |
| address | string? | physical address |
| mapUrl | string? | Google Maps link |
| operatingMode | enum: BASE \| FULL | BASE = standalone Vetrina; FULL = Vetrina + HUB |
| orderingEnabled | boolean | enables reservation/order flow |
| shareToken | string? unique | private-link share token |
| shareTokenExpiresAt | datetime? | |
| createdAt | datetime | |
| updatedAt | datetime | |

Relations: `User[]`, `Product[]`, `Category[]`, `Brand[]`, `Collection[]`, `Page[]`, `B2BCatalog[]`, `MediaAsset[]`, `PublicationTarget[]`, `PublishEvent[]`

### User

A person who has access to a shop's Vetrina dashboard.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| email | string unique | |
| passwordHash | string | |
| name | string? | |
| shopId | string | FK → Shop |
| role | enum: OWNER \| ADMIN \| EDITOR \| SALES_OPERATOR \| B2B_MANAGER \| APPROVER | see roles document |
| createdAt | datetime | |
| updatedAt | datetime | |

---

## 2. Product Authoring Domain

### Product

The commercial representation of a product as curated for publication. Not the ERP master record.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| title | string | display title |
| shortDescription | string? | headline copy, 1-2 sentences |
| longDescription | string? | full product description |
| slug | string | unique per shop, used in URLs |
| sku | string? | commercial reference code |
| brandId | string? | FK → Brand |
| categoryId | string? | FK → Category |
| tags | string[] | free-form merchandising tags |
| badges | enum[]: NEW \| FEATURED \| PROMO \| LIMITED \| BESTSELLER \| SEASONAL | display badges |
| highlights | string[] | up to 5 bullet-point selling highlights |
| presentationNotes | string? | internal notes for commercial team |
| priceCents | int? | primary display price (nullable for B2B-only or informational) |
| isPurchasable | boolean | whether product has direct purchase action |
| displayStatus | enum: DRAFT \| ACTIVE \| INACTIVE \| ARCHIVED \| SEASONAL | controls appearance in Vetrina UI |
| publicationReadiness | int | 0-100 score; computed from required field completeness |
| sortOrder | int | default sort within listings |
| createdAt | datetime | |
| updatedAt | datetime | |

Relations: `ProductMedia[]`, `ProductVariantView[]`, `CollectionItem[]`, `PublicationIntent[]`, `B2BCatalogItem[]`

**Rules:**
- `displayStatus` is a Vetrina-internal editorial state, not the same as `PublicationIntent.status`.
- A product may exist in Vetrina (`ACTIVE`) but have no live `PublicationIntent` — it is not yet published anywhere.
- `publicationReadiness` is recomputed on save: penalizes missing title, missing cover image, missing description, etc.

### ProductVariantView

Variant-facing display info for products with multiple options (size, color, configuration). This is the presentation layer, not the inventory truth.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| productId | string | FK → Product |
| label | string | e.g. "Red / XL" |
| sku | string? | variant-level reference |
| attributes | JSON | free-form key-value pairs: { "color": "Red", "size": "XL" } |
| priceCents | int? | override price for this variant |
| coverAssetId | string? | FK → MediaAsset — variant-specific image |
| sortOrder | int | |
| isAvailable | boolean | whether this variant is currently shown |
| createdAt | datetime | |

### ProductMedia

Associates media assets to a product, with role and ordering.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| productId | string | FK → Product |
| assetId | string | FK → MediaAsset |
| role | enum: COVER \| GALLERY \| HERO \| THUMBNAIL | intended display context |
| sortOrder | int | order within same role |
| altText | string? | overrides MediaAsset.altText for this product context |
| createdAt | datetime | |

Unique constraint: `(productId, assetId, role)`.

### Brand

A commercial brand associated with products.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| name | string | |
| slug | string | unique per shop |
| description | string? | |
| logoAssetId | string? | FK → MediaAsset |
| websiteUrl | string? | |
| sortOrder | int | |
| createdAt | datetime | |
| updatedAt | datetime | |

### Category

Product taxonomy. Supports one level of nesting (parent/child).

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| parentId | string? | FK → Category (self-reference for nested categories) |
| name | string | |
| slug | string | unique per shop |
| description | string? | |
| coverAssetId | string? | FK → MediaAsset |
| sortOrder | int | |
| createdAt | datetime | |
| updatedAt | datetime | |

---

## 3. Publication Domain

### PublicationTarget

A named surface or channel that products and pages can be published to.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| type | enum: STOREFRONT \| B2B_CATALOG \| ECOMMERCE_CHANNEL \| WIDGET \| SECTION | |
| name | string | human-readable label, e.g. "Public Storefront", "WooCommerce" |
| channelRef | string? | external reference (e.g. WooCommerce store ID) — used by HUB, not Vetrina |
| isActive | boolean | |
| createdAt | datetime | |

**Rule:** `ECOMMERCE_CHANNEL` targets express intent only in Vetrina. In FULL mode, the actual sync is executed by HUB. In BASE mode, Vetrina may perform a lightweight sync directly.

### PublicationIntent

Records Vetrina's intent to publish a given entity (product, collection, page) to a given target. This is the multi-dimensional publication model.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| entityType | enum: PRODUCT \| COLLECTION \| PAGE | |
| entityId | string | FK → Product \| Collection \| Page (poly) |
| targetId | string | FK → PublicationTarget |
| status | enum: DRAFT \| SCHEDULED \| PUBLISHED \| UNPUBLISHED \| FAILED | |
| scheduledAt | datetime? | when to go live |
| expiresAt | datetime? | when to auto-unpublish |
| publishedAt | datetime? | actual publish timestamp |
| unpublishedAt | datetime? | actual unpublish timestamp |
| audienceRuleId | string? | FK → AudienceRule — optional audience restriction |
| syncStatus | enum: PENDING \| SYNCED \| FAILED \| NOT_APPLICABLE | status of HUB/channel sync; NOT_APPLICABLE in BASE mode |
| syncError | string? | last sync error message |
| updatedAt | datetime | |
| createdAt | datetime | |

Unique constraint: `(entityType, entityId, targetId)` — one intent per entity per target.

### AudienceRule

Defines who can see content governed by this rule.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| name | string | e.g. "B2B Only", "VIP Customers" |
| type | enum: PUBLIC \| B2B_ONLY \| SEGMENT \| PRIVATE_LINK | |
| segmentIds | string[] | FK refs to CustomerGroup ids (for SEGMENT type) |
| accessToken | string? | for PRIVATE_LINK type |
| createdAt | datetime | |

### Collection

A curated group of products independent of taxonomy. Used for campaigns, editorial, seasonal, or B2B.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| name | string | |
| slug | string | unique per shop |
| subtitle | string? | |
| description | string? | |
| type | enum: SEASONAL \| PROMO \| EDITORIAL \| LAUNCH \| OUTLET \| B2B | |
| heroAssetId | string? | FK → MediaAsset |
| startAt | datetime? | campaign window start |
| endAt | datetime? | campaign window end |
| seoTitle | string? | |
| seoDescription | string? | |
| sortOrder | int | |
| isActive | boolean | |
| createdAt | datetime | |
| updatedAt | datetime | |

Relations: `CollectionItem[]`, `PublicationIntent[]`, `SectionBinding[]`

### CollectionItem

Products assigned to a collection, with explicit manual order.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| collectionId | string | FK → Collection |
| productId | string | FK → Product |
| sortOrder | int | |
| createdAt | datetime | |

Unique constraint: `(collectionId, productId)`.

---

## 4. Site Composer Domain

### Page

A composable commercial page managed in Vetrina.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| type | enum: HOMEPAGE \| CATEGORY \| COLLECTION \| LANDING \| BRAND | |
| slug | string | unique per shop (e.g. "home", "summer-2026") |
| title | string | internal editorial label |
| seoTitle | string? | |
| seoDescription | string? | |
| canonicalRef | string? | FK to Category/Collection/Brand when page type is derived |
| createdAt | datetime | |
| updatedAt | datetime | |

Relations: `PageVersion[]`, `PublicationIntent[]`

**Rule:** There is always exactly one `PageVersion` with `status = PUBLISHED` per page at any time. Multiple `DRAFT` versions are allowed.

### PageVersion

A snapshot of a page's section composition at a point in time.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| pageId | string | FK → Page |
| status | enum: DRAFT \| PREVIEW \| PUBLISHED \| ARCHIVED | |
| label | string? | e.g. "Summer launch draft", "v3 test" |
| publishedAt | datetime? | |
| archivedAt | datetime? | |
| createdBy | string | FK → User |
| createdAt | datetime | |

Relations: `SectionInstance[]`, `PreviewSnapshot[]`, `ReleaseRecord[]`

### SectionType

A registered type of section with its schema definition. This is a catalog of available section types — not per-tenant.

| Field | Type | Notes |
|---|---|---|
| id | string | slug-like, e.g. "hero", "carousel", "featured-grid" |
| name | string | human display label |
| description | string? | |
| configSchema | JSON | JSON Schema or Zod-equivalent for the `config` field on SectionInstance |
| allowedBindings | enum[]: PRODUCT \| COLLECTION \| MEDIA_ASSET \| MANUAL | which binding types this section type supports |
| isActive | boolean | whether this type appears in the Composer UI |

**Built-in section types for MVP:**
- `hero` — full-width hero with title, subtitle, CTA, background media
- `carousel` — horizontal product/image carousel
- `featured-grid` — 2–4 column featured products grid
- `promo-banner` — full-width or half-width promotional banner
- `collection-highlight` — collection spotlight with cover and product preview

### SectionInstance

An instance of a SectionType placed on a specific PageVersion.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| pageVersionId | string | FK → PageVersion |
| sectionTypeId | string | FK → SectionType |
| label | string? | optional internal label for the section |
| config | JSON | section-specific configuration (validated against SectionType.configSchema) |
| isEnabled | boolean | whether this section renders on the live page |
| sortOrder | int | position in the page sequence |
| audienceRuleId | string? | FK → AudienceRule — show/hide for audience |
| createdAt | datetime | |
| updatedAt | datetime | |

Relations: `SectionBinding[]`, `SectionVariant[]`

### SectionBinding

Binds a real entity (product, collection, or media asset) to a slot inside a section.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| sectionInstanceId | string | FK → SectionInstance |
| slot | string | named slot within the section, e.g. "products", "heroImage", "ctaCollection" |
| bindingType | enum: PRODUCT \| COLLECTION \| MEDIA_ASSET \| MANUAL | |
| refId | string | FK → Product \| Collection \| MediaAsset (poly, per bindingType) |
| manualValue | JSON? | for MANUAL type — free-form structured data |
| sortOrder | int | ordering within the same slot (for slots that accept multiple items) |
| createdAt | datetime | |

### SectionVariant

Optional named variant of a section instance (for future A/B or seasonal variants). Not active in MVP.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| sectionInstanceId | string | FK → SectionInstance |
| variantKey | string | e.g. "A", "B", "holiday" |
| config | JSON | config override for this variant |
| isActive | boolean | which variant is currently live |
| createdAt | datetime | |

---

## 5. Media Domain

### MediaAsset

A single media file, managed in the media library.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| url | string | public delivery URL |
| mimeType | string | e.g. "image/jpeg", "image/webp" |
| width | int? | pixels |
| height | int? | pixels |
| sizeBytes | int | file size |
| altText | string? | default alt text (can be overridden per context) |
| focalPointX | float? | 0.0–1.0 relative X for crop-safe focal point |
| focalPointY | float? | 0.0–1.0 relative Y |
| tags | string[] | optional labeling for media library filtering |
| uploadedBy | string | FK → User |
| createdAt | datetime | |

---

## 6. B2B Catalog Domain

### B2BCatalog

A dedicated product catalog for professional clients or segments.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| name | string | |
| slug | string | unique per shop |
| description | string? | |
| notes | string? | commercial notes visible in B2B context |
| coverAssetId | string? | FK → MediaAsset |
| audienceRuleId | string? | FK → AudienceRule — who can access this catalog |
| priceListRef | string? | reference to an external price list (HUB concern in FULL mode) |
| requestOrderEnabled | boolean | whether clients can submit a request/order from this catalog |
| isActive | boolean | |
| createdAt | datetime | |
| updatedAt | datetime | |

Relations: `B2BCatalogItem[]`

### B2BCatalogItem

A product entry within a B2B catalog.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| catalogId | string | FK → B2BCatalog |
| productId | string | FK → Product |
| sortOrder | int | |
| notes | string? | catalog-specific notes for this product |
| customPriceCents | int? | price override for this catalog context |
| createdAt | datetime | |

Unique constraint: `(catalogId, productId)`.

---

## 7. Preview & Release Domain

### PreviewSnapshot

A temporary preview URL for a PageVersion before it is published.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| pageVersionId | string | FK → PageVersion |
| token | string unique | secret token used in preview URL |
| expiresAt | datetime | |
| createdAt | datetime | |

### PublishEvent

An immutable audit record of every publish or unpublish action.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| shopId | string | FK → Shop |
| entityType | enum: PRODUCT \| PAGE \| COLLECTION \| B2B_CATALOG | |
| entityId | string | |
| action | enum: PUBLISH \| UNPUBLISH \| SCHEDULE \| CANCEL_SCHEDULE \| ROLLBACK | |
| targetId | string? | FK → PublicationTarget (if applicable) |
| actorId | string | FK → User |
| occurredAt | datetime | |
| meta | JSON? | snapshot of relevant state at time of action |

### ReleaseRecord

Records which PageVersion was published and supports rollback.

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| pageId | string | FK → Page |
| pageVersionId | string | FK → PageVersion |
| publishedAt | datetime | |
| publishedBy | string | FK → User |
| rollbackFrom | string? | FK → ReleaseRecord — if this release was a rollback |

---

## Entity Relationship Summary

```
Shop
  ├── User (role)
  ├── Brand
  ├── Category (self-nested)
  ├── Product
  │     ├── ProductVariantView
  │     ├── ProductMedia → MediaAsset
  │     ├── CollectionItem ← Collection
  │     ├── PublicationIntent → PublicationTarget
  │     └── B2BCatalogItem ← B2BCatalog
  ├── MediaAsset
  ├── Collection
  │     ├── CollectionItem
  │     └── PublicationIntent → PublicationTarget
  ├── PublicationTarget
  ├── AudienceRule
  ├── B2BCatalog
  │     └── B2BCatalogItem
  ├── Page
  │     └── PageVersion
  │           ├── SectionInstance
  │           │     ├── SectionBinding → Product | Collection | MediaAsset
  │           │     └── SectionVariant
  │           ├── PreviewSnapshot
  │           └── ReleaseRecord
  └── PublishEvent
```

---

## Domain Boundary Rules

1. **Product Authoring** never executes publication to external channels. It sets `displayStatus` and `publicationReadiness` only.
2. **Publication** records intent (`PublicationIntent.status`). In FULL mode, HUB reads this intent and drives `syncStatus`. In BASE mode, Vetrina may perform direct sync for simple targets.
3. **Site Composer** stores structured configuration, never raw HTML. The storefront maps `SectionType.id` to React/Astro components.
4. **Media** is a service domain: other domains reference `MediaAsset.id`, never embed raw URLs in their own fields.
5. **B2B Catalog** owns catalog composition. Pricing, order processing, and approval flows are HUB concerns.
6. **Preview & Release** records history but does not execute rendering. The storefront reads `PageVersion` state to determine what to render.
