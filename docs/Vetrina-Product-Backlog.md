# Vetrina Product Backlog

## Purpose

This document defines the functional product backlog for **Vetrina** as a mobile-first commercial publishing surface designed to control product visibility, promotional placements, and lightweight content operations for modern storefronts.

Vetrina is not the orchestration core and is not the fiscal/ERP engine. Its role is to give store owners, sales operators, and commercial staff a fast, intuitive, smartphone-friendly interface to manage what is shown online, where it is shown, and whether it is purchasable through one or more channels.

This backlog is intentionally product-oriented rather than implementation-oriented. It is intended to guide product shaping, UX definition, API design, and sequencing decisions before deeper architecture and schema work.

## Product Position

Vetrina should be positioned as a **commercial publishing console** rather than as a generic CMS and not as a replacement for the orchestration HUB.

Its core promise is:

- create or update product-facing content quickly;
- control where each product appears in the storefront;
- decide whether a product is informational, promotional, or directly purchasable;
- manage homepage and campaign visibility from a phone;
- publish without depending on WordPress admin or webmasters.

## Core Product Principles

1. **Mobile-first by default**  
   Every critical action must be comfortably executable from a smartphone.

2. **Publishing before complexity**  
   Vetrina should optimize the speed of commercial updates, not expose heavy ERP-style complexity.

3. **Placement is a first-class concept**  
   A product is not only a PDP entry. It can be placed in hero areas, featured rows, seasonal collections, landing pages, and dynamic sections.

4. **Purchasability is separate from visibility**  
   A product may be visible online without being directly purchasable.

5. **Channel publication is explicit**  
   Publishing to WooCommerce or another ecommerce target must be an intentional per-product decision.

6. **Editorial control must be safe**  
   Changes should support preview, draft, publish, unpublish, schedule, and rollback-friendly behavior.

## Primary User Roles

### Store Owner
Needs to update homepage emphasis, publish featured products, toggle product visibility, and keep control without depending on technical staff.

### Commercial Operator
Needs to push products or collections into promotional areas, manage seasonal campaigns, and rapidly change online visibility.

### Content/Marketing Operator
Needs to adjust copy, images, badges, labels, and landing-page selections.

### Agency or Integrator Admin
Needs configuration visibility, but should not be required for day-to-day publishing.

## Functional Domains

The backlog is organized into 10 domains.

1. Product authoring
2. Media management
3. Visibility and publication states
4. Placement and homepage control
5. Collections and campaign curation
6. Ecommerce channel toggles
7. Preview and scheduling
8. Lightweight analytics and feedback
9. Permissions and safety
10. Operational UX and mobile ergonomics

***

## 1. Product Authoring

### Goal
Allow users to create and maintain the storefront-facing representation of a product without entering technical backoffice systems.

### Must-have backlog items

- Create a new product card with title, short text, long text, SKU/reference, brand, category, tags, and media.
- Edit an existing product quickly from mobile.
- Save draft state without immediate publication.
- Duplicate an existing product as a starting point for similar products.
- Mark product as active, inactive, archived, or seasonal.
- Define purchasable vs informational product type.
- Support simple and variant-aware representation at the UI layer.
- Allow manual sorting priority for featured contexts.

### Should-have items

- Product badges such as New, Featured, Promo, Limited, Bestseller.
- Rich highlight bullets for quick display in cards and hero blocks.
- Short commercial summary distinct from technical description.
- Optional CTA text override for selected contexts.

### Future items

- AI-assisted copy refinement.
- Auto-suggestion of tags and placements.
- Product templates by vertical or category.

***

## 2. Media Management

### Goal
Make product imagery and promotional visuals easy to control from a phone.

### Must-have backlog items

- Upload main image and gallery images.
- Reorder gallery images with touch-friendly controls.
- Choose a featured image per placement context.
- Crop-safe focal point selection for hero and carousel contexts.
- Mark image alt text and basic SEO-friendly captions.
- Remove or replace obsolete media.

### Should-have items

- Separate image choices for product page vs homepage hero.
- Support promo banner image or square tile image variants.
- Basic image compression/optimization pipeline.

### Future items

- AI-assisted background cleanup.
- Smart cropping for multiple aspect ratios.
- Short promotional video support.

***

## 3. Visibility And Publication States

### Goal
Separate product existence from public visibility.

### Core model
A product should have independent state dimensions rather than a single yes/no status.

### Must-have backlog items

- Draft / Published / Unpublished state.
- Visible on site yes/no.
- Visible in search/listing yes/no.
- Purchasable online yes/no.
- Featured yes/no.
- Hidden but linkable yes/no.
- Archive state for retired products.

### Should-have items

- Reason codes for unpublished state.
- Soft-expiration dates for seasonal visibility.
- Auto-hide after end date.

### Future items

- Rule-based visibility by stock, season, or connector state.

***

## 4. Placement And Homepage Control

### Goal
Treat homepage and key sections as dynamic commercial surfaces managed from Vetrina.

### Must-have backlog items

- Toggle “show in homepage hero”.
- Toggle “show in featured carousel”.
- Toggle “show in homepage featured grid”.
- Toggle “show in outlet/promo section”.
- Select placement priority/order.
- Limit a placement to a date range.
- Attach a short promo headline and CTA for placement use.
- Enable/disable a product from a placement without unpublishing the product itself.

### Should-have items

- Multiple hero slots.
- Named homepage sections configurable by tenant.
- Drag-and-drop or touch reorder for featured items.
- Visual preview of homepage composition.

### Future items

- Rules-based homepage rotation.
- Personalized or segmented placements.
- A/B test support for hero and featured sections.

***

## 5. Collections And Campaign Curation

### Goal
Allow operators to curate thematic product groups independent of taxonomy.

### Must-have backlog items

- Create a named collection.
- Add/remove products from a collection.
- Set collection title, subtitle, slug, hero media, and date range.
- Publish a collection as a landing page or dynamic section.
- Sort products manually inside the collection.

### Should-have items

- Campaign types: seasonal, promo, editorial, launch, outlet.
- Collection badges and banners.
- Collection-level SEO title and meta description.

### Future items

- Rule-generated collections based on tags/attributes.
- Collection cloning for recurring campaigns.

***

## 6. Ecommerce Channel Toggles

### Goal
Make channel publication explicit and understandable.

### Core principle
WooCommerce is a target channel, not the master of all visibility decisions.

### Must-have backlog items

- Toggle “publish to ecommerce channel”.
- Show per-product channel publication status.
- Show sync state: pending, published, failed, outdated.
- Manual retry action when publication fails.
- Clear distinction between:
  - visible on site,
  - featured in placements,
  - purchasable online,
  - published to WooCommerce.

### Should-have items

- Support multiple channel targets in the future.
- Per-channel price override visibility.
- Channel-level publish notes or warnings.

### Future items

- Multi-channel publication policies.
- Partial catalog publication rules by tenant.

***

## 7. Preview And Scheduling

### Goal
Give commercial confidence before making changes public.

### Must-have backlog items

- Preview a product before publication.
- Preview homepage placements before activation.
- Schedule publish start date/time.
- Schedule unpublish end date/time.
- Save draft changes without affecting live content.

### Should-have items

- Preview by placement context (PDP, hero, carousel, collection).
- Change history for key product-facing fields.
- Publish confirmation step for critical homepage changes.

### Future items

- Rollback to previous published version.
- Compare draft vs live view.

***

## 8. Lightweight Analytics And Feedback

### Goal
Help users understand whether promoted products and placements are working.

### Must-have backlog items

- Show basic placement exposure metrics if available.
- Show click count or CTR for hero and featured items.
- Highlight products receiving attention but not published to ecommerce.

### Should-have items

- Placement performance comparison.
- Recently changed products summary.
- “Underperforming featured items” hints.

### Future items

- Recommendation engine for placement optimization.
- Campaign reporting by date range.

***

## 9. Permissions And Safety

### Goal
Prevent accidental publishing errors while staying simple.

### Must-have backlog items

- Role-based access at least for owner, editor, operator, admin.
- Separate permission for publishing vs editing.
- Confirmation for destructive actions.
- Audit trail for publish/unpublish and placement changes.

### Should-have items

- Approval mode for selected tenants.
- Restricted editing by product/collection scope.

### Future items

- Fine-grained workflow approval chains.

***

## 10. Operational UX And Mobile Ergonomics

### Goal
Make Vetrina genuinely usable from a smartphone during normal store operations.

### Must-have backlog items

- Fast product search by title, SKU, brand, category.
- One-thumb friendly key actions.
- Sticky primary action bar on mobile.
- Status chips visible at a glance.
- Minimal-step publishing workflow.
- Touch-friendly image reorder and placement reorder.

### Should-have items

- Quick filters: Draft, Published, Featured, Hero, Ecommerce, Seasonal.
- Bulk actions for visibility and placement changes.
- Saved views.

### Future items

- Offline-tolerant drafts.
- Push notifications for failed publications.

***

## Priority Proposal

### Phase 1 — Sellable MVP

This phase should be sufficient for a first real pilot and commercial presentation.

- Product create/edit
- Media upload and featured image management
- Draft/published states
- Publish to site toggle
- Publish to ecommerce toggle
- Hero and featured carousel toggles
- Featured grid toggle
- Collections basic management
- Preview
- Scheduling basic start/end dates
- Channel sync state indicator
- Mobile-first search and filters

### Phase 2 — Strong Operational Product

- Change history
- Retry workflows
- Homepage composition preview
- Campaign landing pages
- Collection SEO metadata
- Basic analytics for placements
- Bulk actions
- Permission hardening

### Phase 3 — Differentiation Layer

- AI-assisted content suggestions
- Smart placements
- Multi-channel publishing
- Rules-based visibility
- A/B testing
- Advanced analytics and recommendations

## Product Boundaries

To keep Vetrina clean and sellable, the following should remain outside its primary scope:

- ERP master-data complexity
- accounting/fiscal logic
- shipping execution workflows
- anomaly resolution engines
- deep connector configuration
- webhook processing core

Those belong to the HUB or to dedicated operational modules.

## Strategic Positioning Statement

Vetrina is a mobile-first commercial publishing layer that lets a store control products, homepage visibility, collections, and ecommerce publication without depending on WordPress admin or developer intervention.

It is not a generic CMS, not a page builder, and not the orchestration engine. Its strength is fast commercial control over what appears online, where it appears, and whether it is purchasable.

## Next Document Reminder

The next document to produce after this one should be:

**hub-vetrina-frontends-architecture.md**

That document should explain the logical relationships and flow boundaries between:

- Vetrina
- HUB core
- normalized catalog
- placements
- WooCommerce as channel
- public frontend (Astro/React)
- order/event flows