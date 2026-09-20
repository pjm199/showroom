# Frontend Rendering And Route Strategy

## Purpose

This document defines the frontend rendering and routing strategy for the public site that is powered by the normalized catalog, publication/placement domain, and Vetrina.

The goal is to:

- treat the site as a **proprietary social feed** of products, stories, and promotions;
- keep the frontend **SEO-first and fast**, not a thin JS shell;
- make homepage, collections, and product pages feel **alive and dynamic** while keeping rendering predictable and crawlable;
- keep business rules in the HUB/catalog layer and presentation logic in the frontend layer.

---

## 1. High-Level Frontend Principles

1. **SEO-first rendering**  
   - HTML for SEO-critical pages must be present in initial responses.
   - Avoid relying on client-only fetch for essential content.

2. **Content-first, JS-second**  
   - Use Astro/SSR/SSG to deliver content as HTML.
   - Use React islands for interactive components, not for the core content existence.

3. **Routes mirror business concepts**  
   - Homepage, categories, collections, campaigns, product pages reflect the publishing model.

4. **Frontend consumes view models, not raw DB tables**  
   - Backend prepares tailored view models for homepage, listings, and detail pages.

5. **“My site is my social feed”**  
   - Vetrina drives a continuous flow of publishable content.
   - The frontend is the feed where that content lives permanently under the merchant's domain.

---

## 2. Core Route Types

The frontend should support at least the following logical route types.

1. **Homepage** – the primary “feed” entry point.
2. **Category pages** – taxonomy-based groupings.
3. **Collection/campaign pages** – curated groupings.
4. **Product detail pages (PDP)** – single product focus.
5. **Brand pages** – brand-centric view.
6. **Utility pages** – about, contact, policies, etc.

Later, additional routes (e.g., blog, guides) can be integrated with the same publishing discipline.

---

## 3. Homepage Strategy

The homepage should be treated as the main **“social-like” feed surface** owned by the merchant.

### 3.1 Data Model

Frontend consumes a **HomepageViewModel** from the backend with:

- heroSurface: list of ProductCardViewModel (limited, ordered).
- featuredCarousel: list of ProductCardViewModel.
- featuredGrid: list of ProductCardViewModel.
- outletSection: list of ProductCardViewModel.
- seasonalCollections: list of CollectionSummaryViewModel.
- editorialBlocks: optional content blocks (e.g., brand story, services).

Each ProductCardViewModel includes:

- id, slug
- title, short description
- price info (if relevant)
- main image URL + alt text
- badges (New, Promo, Best, etc.)
- flags derived from publication and placement (e.g., hero, outlet)

### 3.2 Rendering Strategy

- Use **SSR or SSG** for the homepage route to ensure HTML is ready for crawlers.
- Hero, carousel, and grid sections are rendered server-side from the view model.
- React/JS is used to enhance interactions (e.g. carousels, lazy loading), not to create core content.

### 3.3 Dynamics

- Vetrina updates placements → HUB updates placement records → HomepageViewModel changes.
- On the next request (or on revalidation window), homepage reflects these changes.
- Revalidation strategy can depend on the hosting platform (e.g., ISR-style for static hosting, or on-demand cache invalidation).

---

## 4. Category Pages

Category pages represent taxonomy-based browsing.

### 4.1 Route Shape

- `/c/:categorySlug`
- Nested categories can be represented with slugs or path segments if needed.

### 4.2 Data Model

**CategoryPageViewModel** may include:

- category details (name, description, SEO metadata);
- breadcrumbs (derived from category hierarchy);
- product listing (paged);
- optional featured placements (e.g. “Top picks in this category”).

### 4.3 Rendering

- Prefer SSR/SSG for category pages.
- Pagination can be SSR or hybrid (server initial page + client fetch for subsequent pages) depending on scale.

---

## 5. Collection / Campaign Pages

Collection and campaign pages are where the “social feed” idea becomes most visible: curated groups that feel like thematic posts.

### 5.1 Route Shape

- `/collections/:collectionSlug`

### 5.2 Data Model

**CollectionPageViewModel** includes:

- collection core fields: name, subtitle, description, type;
- hero media;
- SEO metadata;
- publish window data (start/end);
- ordered product cards.

### 5.3 Rendering

- Again SSR/SSG for initial content.
- Collections are natural landing pages for social campaigns.
- Social posts (Instagram, Facebook, etc.) should link to these URLs to create permanent SEO and business value.

---

## 6. Product Detail Pages (PDP)

Product pages are the core of commercial detail.

### 6.1 Route Shape

- `/p/:productSlug`

### 6.2 Data Model

**ProductPageViewModel** includes:

- product core fields (title, long description, technical details);
- variants (if any);
- media gallery;
- price info;
- stock status (if appropriate to show);
- SEO metadata;
- breadcrumbs (category, collection context);
- promotional flags derived from placements (e.g. “Featured in Summer Collection”).

### 6.3 Rendering

- SSR/SSG strongly recommended for product pages.
- Structured data (Product schema) should be generated from the normalized model.
- Add-to-cart or lead actions can be implemented as React islands over the rendered HTML.

---

## 7. Brand Pages

Optional but often useful for SEO and navigation.

### 7.1 Route Shape

- `/b/:brandSlug`

### 7.2 Data Model

**BrandPageViewModel** includes brand info, hero media, and a listing of products and/or collections.

---

## 8. Rendering Modes And Caching

### 8.1 Static Generation (SSG)

Use SSG for:

- homepage when revalidation windows are acceptable;
- categories with manageable cardinality;
- collections with known slugs;
- product pages if product count is moderate and caching strategy is robust.

### 8.2 Server-Side Rendering (SSR)

Use SSR for:

- high-cardinality product catalogs where full pre-generation is not practical;
- contexts where near-real-time updates from Vetrina are required without waiting for static rebuilds.

### 8.3 Incremental / On-demand Revalidation

- When using SSG, combine with on-demand revalidation triggered by publishing events from Vetrina/HUB.
- Example: when a placement is changed or a product is published/unpublished, issue a revalidation request for affected routes.

---

## 9. API Contracts For Frontend

The frontend should consume view models through a small set of well-shaped endpoints.

### 9.1 Example Endpoints

- `GET /api/frontend/homepage` → HomepageViewModel
- `GET /api/frontend/category/:slug` → CategoryPageViewModel
- `GET /api/frontend/collection/:slug` → CollectionPageViewModel
- `GET /api/frontend/product/:slug` → ProductPageViewModel
- `GET /api/frontend/brand/:slug` → BrandPageViewModel

These endpoints should:

- expose only what is needed for rendering;
- hide internal IDs and implementation details where possible;
- include SEO metadata directly in the payload.

### 9.2 Multi-Tenant Considerations

- Tenants should be resolved via hostname, path prefix, or auth, depending on product shape.
- View models should always be tenant-scoped.

---

## 10. “Site As My Social Feed” Behavior

To support the "my site is my social network" strategy:

1. **Frequent, lightweight publishing**  
   - Vetrina allows quick creation of products, collections, and placements.
   - Every such action feeds new content into homepage and collection routes.

2. **Stable, shareable URLs**  
   - Each collection, product, or campaign has stable URLs that can be shared on social networks.

3. **Evergreen content**  
   - Unlike social posts that disappear in feeds, the site keeps a permanent, structured record.

4. **SEO accumulation**  
   - External links and social clicks accumulate value for these URLs over time.

5. **Clear fallbacks**  
   - When a collection ends, URLs can redirect to successors or related pages, preserving link equity.

---

## 11. What The Frontend Must Not Do

To preserve a clean architecture, the frontend must NOT:

- implement its own ad-hoc product states beyond what the backend provides;
- embed WooCommerce or Shopify IDs directly in page logic except via controlled adapters;
- re-implement publication and placement decision logic client-side;
- become a generic drag-and-drop page builder.

The frontend is the **stage**, not the **director**.

---

## 12. Next Steps

Following this strategy document, the next concrete steps are:

1. Define real TypeScript interfaces for the view models.
2. Implement minimal `/api/frontend/*` endpoints that use the catalog and publication model.
3. Build an initial Astro frontend consuming those endpoints.
4. Hook Vetrina publishing events to cache invalidation / revalidation mechanisms.

This creates an end-to-end spine: Vetrina → HUB/catalog → frontend view models → customer-facing pages.
