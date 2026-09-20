# Mapping GraphQL SDL ↔ TypeScript (`types/v2`)

Lo schema [graphql/storefront-read.graphql](../graphql/storefront-read.graphql) è il contratto **read-only** per il futuro server GraphQL. I payload REST attuali devono restare allineati agli stessi concetti in [types/v2/storefront.ts](../types/v2/storefront.ts), [types/v2/composer.ts](../types/v2/composer.ts), ecc.

## Root query

| GraphQL (`StorefrontQuery`) | REST attuale | TypeScript view model |
|-----------------------------|--------------|-------------------------|
| `homepage(shopSlug)` | `GET /api/v2/frontend/{shopSlug}/homepage` | `HomepageViewModel` in `types/v2/storefront.ts` |
| `productPage(shopSlug, productSlug)` | `GET /api/v2/frontend/{shopSlug}/products/{slug}` | `ProductPageViewModel` |
| `collectionPage(shopSlug, collectionSlug)` | `GET /api/v2/frontend/{shopSlug}/collections/{slug}` | `CollectionPageViewModel` |

## Tipi condivisi

| GraphQL | TypeScript | File |
|---------|------------|------|
| `ShopSummary` | `ShopSummary` | `types/v2/tenant.ts` |
| `SeoMeta` | `SeoMeta` | `types/v2/composer.ts` |
| `MediaViewModel` | `MediaViewModel` | `types/v2/media.ts` |
| `MediaFocalPoint` | `{ x, y }` in `MediaViewModel.focalPoint` | `types/v2/media.ts` |
| `ProductBadge` (enum) | `ProductBadge` | `types/v2/product.ts` |
| `CollectionType` (enum) | `CollectionType` | `types/v2/catalog.ts` |
| `BrandSummary` | `BrandSummary` | `types/v2/catalog.ts` |
| `CategorySummary` | `CategorySummary` | `types/v2/catalog.ts` |
| `BreadcrumbItem` | `BreadcrumbItem` | `types/v2/catalog.ts` |

## Homepage / composer

| GraphQL | TypeScript | Note |
|---------|------------|------|
| `HomepageViewModel` | `HomepageViewModel` | `types/v2/storefront.ts` |
| `RenderedSection` | `RenderedSection` | `types/v2/composer.ts` |
| `RenderedSection.config` | `Record<string, unknown>` | GraphQL: `JSONObject` |
| `RenderedSection.bindings` | `RenderedSectionBinding` | Struttura dinamica per slot; GraphQL: `JSONObject` fino a eventuale union tipizzata in P1+ |

## Product page

| GraphQL | TypeScript | Note |
|---------|------------|------|
| `StorefrontProductDetail` | annidato in `ProductPageViewModel.product` | `types/v2/storefront.ts` |
| `StorefrontProductMedia` | media risolti lato view-model (non `ProductMediaV2` grezzo) | Campi `url`, `altText`, … come nel VM |
| `VariantViewModel` | `VariantViewModel` | `types/v2/product.ts` |
| `VariantViewModel.attributes` | `Record<string, string>` | GraphQL: `JSONObject` per semplicità schema |
| `ProductJsonLd` | `ProductJsonLd` | `types/v2/storefront.ts` |
| `ProductJsonLd.context` | `@context` nel JSON-LD | Nel JSON output il campo resta `@context`; nello schema GraphQL si usa `context` (senza `@`) |

## Collection page

| GraphQL | TypeScript |
|---------|------------|
| `CollectionPageViewModel` | `CollectionPageViewModel` |
| `StorefrontCollectionDetail` | `CollectionPageViewModel.collection` |
| `ProductCardViewModel` | `ProductCardViewModel` |
| `CollectionSummaryViewModel` | `CollectionSummaryViewModel` |

## Drift da evitare

- Ogni modifica a `types/v2/storefront.ts` (o view-model builder in `lib/v2/frontend/view-models.ts`) che impatta il payload pubblico deve essere riflessa in `storefront-read.graphql` e rigenerare `npm run graphql:codegen`.
