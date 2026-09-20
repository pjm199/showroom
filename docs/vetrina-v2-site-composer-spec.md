# Vetrina V2 — Site Composer Spec

This document defines the detailed structure, behavior, and rules for the Site Composer module in Vetrina V2. It covers pages, page versions, section types, section instances, bindings, variants, preview, and publication.

---

## Guiding Principles

1. **Section-based, not free-form.** A page is always a sequence of typed, configurable sections. No raw HTML blocks, no arbitrary component placement.
2. **Data stored, not markup.** Vetrina stores structured configuration. The storefront app maps each `SectionType` to a React/Astro component and renders accordingly.
3. **One published version at a time.** A page always has at most one `PUBLISHED` PageVersion. All other versions are `DRAFT`, `PREVIEW`, or `ARCHIVED`.
4. **Safe editing.** Editing always operates on a `DRAFT` version. Live content is never mutated in place.
5. **Composable but bounded.** Section types are registered and finite. Merchants select from a library; they do not define arbitrary components.

---

## Page Model

### Page Types

| Type | Purpose | Slug convention |
|---|---|---|
| `HOMEPAGE` | Primary merchant storefront entry point | `home` (one per shop) |
| `CATEGORY` | Product taxonomy page | matches `Category.slug` |
| `COLLECTION` | Campaign/curated product page | matches `Collection.slug` |
| `LANDING` | Standalone commercial landing page | free slug |
| `BRAND` | Brand-focused page | matches `Brand.slug` |

**Rules:**
- There is exactly one `HOMEPAGE` per shop.
- `CATEGORY`, `COLLECTION`, and `BRAND` pages are linked to their canonical entity via `canonicalRef`.
- `LANDING` pages have no canonical entity reference.
- Multiple `LANDING` pages per shop are allowed.

### Page Lifecycle

```
created → has one empty DRAFT PageVersion
editing → DRAFT version is modified
preview → DRAFT version generates a PreviewSnapshot (expiring URL)
publish → DRAFT version moves to PUBLISHED; previous PUBLISHED moves to ARCHIVED
rollback → ARCHIVED version clones into new DRAFT; DRAFT can be published
```

---

## PageVersion States

```
DRAFT    → editable; not publicly visible
PREVIEW  → read-only preview via token URL; not publicly visible
PUBLISHED → live on the storefront; not editable (must create new DRAFT to edit)
ARCHIVED → previous published versions; available for rollback
```

**State transitions:**

```
DRAFT → PUBLISHED   (publish action; previous PUBLISHED auto-moves to ARCHIVED)
DRAFT → PREVIEW     (preview action; creates PreviewSnapshot; version stays DRAFT)
PUBLISHED → ARCHIVED (automatic when a newer version is published)
ARCHIVED → DRAFT    (rollback; clones the ARCHIVED version's sections into a new DRAFT)
```

**Invariant:** At all times, `count(PUBLISHED versions per page) ≤ 1`.

---

## Section Type Library

### Registered Section Types (MVP)

#### `hero`

Full-width hero with background media, headline, subheadline, and CTA.

| Config field | Type | Required | Notes |
|---|---|---|---|
| `headline` | string | yes | Main heading text |
| `subheadline` | string | no | Supporting text |
| `ctaLabel` | string | no | Button label |
| `ctaUrl` | string | no | Button destination URL |
| `overlay` | boolean | no | Dark overlay on background media |
| `textAlign` | `left` \| `center` \| `right` | no | Default: `left` |

| Binding slot | Accepted type | Cardinality | Notes |
|---|---|---|---|
| `backgroundMedia` | `MEDIA_ASSET` | 0–1 | Background image or video |
| `ctaCollection` | `COLLECTION` | 0–1 | Optional collection link override |

---

#### `carousel`

Horizontal scrolling row of product cards or media items.

| Config field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | no | Section heading |
| `subtitle` | string | no | |
| `itemsPerView` | 2–6 | no | Default: 4 |
| `showPrices` | boolean | no | Default: true |
| `showBadges` | boolean | no | Default: true |
| `autoplay` | boolean | no | Default: false |

| Binding slot | Accepted type | Cardinality | Notes |
|---|---|---|---|
| `products` | `PRODUCT` | 1–20 | Items in the carousel |
| `collection` | `COLLECTION` | 0–1 | If set, products are sourced from collection (overrides `products` slot) |

---

#### `featured-grid`

Grid of featured products with title and optional subtitle.

| Config field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | no | Section heading |
| `subtitle` | string | no | |
| `columns` | 2 \| 3 \| 4 | no | Default: 3 |
| `showPrices` | boolean | no | Default: true |
| `showBadges` | boolean | no | Default: true |

| Binding slot | Accepted type | Cardinality | Notes |
|---|---|---|---|
| `products` | `PRODUCT` | 1–12 | Featured products |

---

#### `promo-banner`

Full-width or half-width promotional banner with optional CTA.

| Config field | Type | Required | Notes |
|---|---|---|---|
| `headline` | string | yes | |
| `subheadline` | string | no | |
| `ctaLabel` | string | no | |
| `ctaUrl` | string | no | |
| `layout` | `full` \| `half-left` \| `half-right` | no | Default: `full` |
| `backgroundColor` | string | no | Hex color fallback |

| Binding slot | Accepted type | Cardinality | Notes |
|---|---|---|---|
| `bannerImage` | `MEDIA_ASSET` | 0–1 | Banner background |

---

#### `collection-highlight`

Showcase a collection with cover, name, description, and a product preview strip.

| Config field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | no | Override collection name |
| `subtitle` | string | no | Override collection subtitle |
| `ctaLabel` | string | no | Default: "View collection" |
| `previewCount` | 3–6 | no | How many products to show in preview |

| Binding slot | Accepted type | Cardinality | Notes |
|---|---|---|---|
| `collection` | `COLLECTION` | 1 | Required — the collection to highlight |
| `heroMedia` | `MEDIA_ASSET` | 0–1 | Override collection hero image |

---

### Future Section Types (Premium Layer)

- `brand-showcase` — horizontal brand logos strip
- `testimonials` — reassurance / social proof block
- `cta-strip` — full-width call to action with optional email capture
- `editorial-block` — rich text + image editorial
- `b2b-callout` — B2B catalog entry point block
- `category-grid` — navigation grid of category tiles
- `outlet-section` — promo/outlet product row (distinct styling)

---

## Section Instance Rules

- A `SectionInstance` belongs to exactly one `PageVersion`.
- When a `DRAFT` is cloned (for rollback or duplicate), all `SectionInstance` and `SectionBinding` records are deep-copied into the new version.
- `sortOrder` values are non-negative integers. Gaps are allowed. The UI must normalize on reorder.
- `config` is validated on save against `SectionType.configSchema`. Invalid configs are rejected with a 400 `VALIDATION_ERROR`.
- A `SectionInstance` with `isEnabled = false` is saved but does not appear in the storefront rendering or the `HomepageViewModel`.

---

## Section Binding Rules

- A binding has a named `slot` that corresponds to a defined slot in the `SectionType`.
- `bindingType` must match an allowed type from `SectionType.allowedBindings`.
- Within a slot that accepts multiple items (cardinality > 1), `sortOrder` controls the display order.
- Deleting a `Product`, `Collection`, or `MediaAsset` that is bound to a section does NOT cascade-delete the binding — the binding becomes a dangling reference. The storefront rendering layer must handle missing refs gracefully (skip the item).
- The API returns bindings with their resolved entity inline (populated join). If the entity is deleted, `resolvedEntity` is `null`.

---

## Preview Flow

1. User requests preview for a `DRAFT` PageVersion.
2. API creates a `PreviewSnapshot` with a unique token and a 24-hour expiry.
3. Preview URL format: `https://<storefront-domain>/preview?token=<token>`
4. The storefront reads the token, validates it against `PreviewSnapshot`, and renders the corresponding `PageVersion` regardless of its `status`.
5. `PreviewSnapshot` expires after 24 hours or after the version is published (whichever comes first).
6. Multiple preview snapshots per version are allowed (for sharing with different reviewers).

---

## Publish Flow

1. User requests publish for a `DRAFT` PageVersion.
2. Server validates:
   - Version is `DRAFT`.
   - Page has at most one `PUBLISHED` version (if so, it will be archived).
   - Required bindings are satisfied (e.g. `hero` must have `backgroundMedia` or `config.backgroundColor`).
3. Within a transaction:
   - Current `PUBLISHED` version → `ARCHIVED`.
   - Target `DRAFT` version → `PUBLISHED`, `publishedAt` set to now.
   - `ReleaseRecord` created.
   - `PublishEvent` created.
4. On success, the API emits a cache-invalidation call to the storefront for affected routes.

---

## Rollback Flow

1. User selects an `ARCHIVED` PageVersion and requests rollback.
2. Server deep-clones the archived version's `SectionInstance[]` and `SectionBinding[]` into a new `DRAFT` PageVersion.
3. The new `DRAFT` has `label = "Rollback from [archivedVersion.publishedAt]"`.
4. `ReleaseRecord.rollbackFrom` references the archived `ReleaseRecord`.
5. User reviews the new `DRAFT` and publishes it when satisfied.

Rollback is non-destructive: it creates a new DRAFT and never deletes existing versions.

---

## Storefront Integration Contract

The storefront app must follow these rules when consuming Site Composer data:

### Rendering Algorithm

```
1. GET /api/v2/frontend/:shopSlug/homepage
   → HomepageViewModel

2. For each section in HomepageViewModel.sections (already ordered, isEnabled=true):
   a. Resolve the React/Astro component mapped to section.type
   b. Pass section.config as props
   c. Pass section.bindings slots as resolved entity arrays/objects
   d. Render component

3. If a binding slot reference is null (deleted entity):
   → skip that item silently; do not throw
```

### Section Type → Component Mapping

The storefront maintains a static registry:

```typescript
const SECTION_COMPONENTS: Record<SectionTypeId, ComponentType> = {
  'hero': HeroSection,
  'carousel': CarouselSection,
  'featured-grid': FeaturedGridSection,
  'promo-banner': PromoBannerSection,
  'collection-highlight': CollectionHighlightSection,
}
```

Unknown `sectionTypeId` values must be skipped gracefully (logged, not thrown).

### Cache Invalidation

When Vetrina publishes a new `PageVersion`, it calls `/api/v2/frontend/revalidate` with:
- For `HOMEPAGE`: `['/']` and `['/:shopSlug']`
- For `COLLECTION`: `['/collections/:slug']`
- For `CATEGORY`: `['/c/:slug']`
- For `LANDING`: `['/:slug']`

The storefront uses Next.js `revalidatePath` or Astro equivalent.

---

## Section Config Schema Format

Each `SectionType.configSchema` uses a simplified JSON Schema subset for validation. Example for `hero`:

```json
{
  "type": "object",
  "properties": {
    "headline": { "type": "string", "minLength": 1, "maxLength": 120 },
    "subheadline": { "type": "string", "maxLength": 200 },
    "ctaLabel": { "type": "string", "maxLength": 40 },
    "ctaUrl": { "type": "string", "format": "uri" },
    "overlay": { "type": "boolean" },
    "textAlign": { "type": "string", "enum": ["left", "center", "right"] }
  },
  "required": ["headline"]
}
```

Config validation runs server-side on every `PATCH /sections/:id` call.

---

## Homepage Composition Example

A typical homepage for a fashion/lifestyle store built with V2 Site Composer:

```
Page: "home" (HOMEPAGE)
└── PageVersion (PUBLISHED)
    ├── [0] hero (isEnabled: true)
    │       config: { headline: "Nuovi arrivi estate", ctaLabel: "Scopri", overlay: true }
    │       bindings: { backgroundMedia: <asset>, ctaCollection: <estate-2026 collection> }
    │
    ├── [1] carousel (isEnabled: true)
    │       config: { title: "In evidenza", itemsPerView: 4 }
    │       bindings: { products: [p1, p2, p3, p4, p5] }
    │
    ├── [2] promo-banner (isEnabled: false)   ← disabled, not rendered
    │       config: { headline: "Saldi fino al 30%" }
    │       bindings: { bannerImage: <asset> }
    │
    ├── [3] collection-highlight (isEnabled: true)
    │       config: { ctaLabel: "Vai alla collezione" }
    │       bindings: { collection: <outdoor-2026>, heroMedia: null }
    │
    ├── [4] featured-grid (isEnabled: true)
    │       config: { title: "Bestseller", columns: 3 }
    │       bindings: { products: [p6, p7, p8, p9, p10, p11] }
    │
    └── [5] promo-banner (isEnabled: true)
            config: { headline: "Showroom fisico — Via Roma 12", layout: "full" }
            bindings: {}
```

The storefront receives this as `HomepageViewModel.sections` with only the `isEnabled: true` sections, pre-ordered by `sortOrder`.

---

## Non-Goals for Site Composer

The following are explicitly out of scope for Site Composer in all versions:

- Raw HTML or rich-text block editors within sections
- Drag-and-drop of arbitrary page elements (only section-level reordering is supported)
- CSS/style overrides per section (design tokens come from the storefront theme)
- Custom section type registration by merchants (only by developers deploying the system)
- Multi-page nested navigation composition (menus are managed separately)
- Full revision diff view (version history shows which version was live when, not field-level diffs)
