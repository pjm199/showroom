# HUB + Vetrina + Public Frontend Architecture

## Purpose

This document defines the logical architecture and responsibility boundaries between **Vetrina**, the **HUB core**, the **normalized catalog domain**, **placement/publication logic**, **WooCommerce as a channel**, and the **public frontend**.

The goal is not to describe infrastructure deployment in detail, but to establish a precise system model that prevents role confusion and supports a sellable, reusable product shape.

This document should be read as the companion architecture file to the Vetrina product backlog and the broader HUB architecture notes.

***

## 1. Architecture Intent

The central architectural goal is to stop treating WordPress/WooCommerce as the center of the digital business.

Instead, the system should be organized around a cleaner separation of concerns:

- **Vetrina** manages commercial publishing intent.
- **HUB core** manages orchestration, normalized business objects, channel publication, audit, and operational flow control.
- **Public frontend** renders the customer-facing website using published data and placement rules.
- **WooCommerce** becomes one possible ecommerce channel rather than the owner of the whole customer experience.

This allows the storefront to become faster, more governable, more SEO-friendly, and less dependent on monolithic CMS behavior.

***

## 2. System Components

### 2.1 Vetrina

Vetrina is the **mobile-first commercial publishing surface**.

Its responsibility is to let business users decide:

- what product-facing content exists;
- what content is visible on the public website;
- what products appear in promotional placements;
- what products should be published to ecommerce channels;
- what should remain draft, hidden, or scheduled.

Vetrina is not the orchestration engine and must not absorb ERP logic, fiscal workflows, shipping operations, or connector complexity.

### 2.2 HUB Core

The HUB core is the **system orchestration and control layer**.

Its responsibilities include:

- normalized catalog persistence;
- mapping external references;
- publication decisions and channel jobs;
- workflow/event orchestration;
- audit logs and state transitions;
- order/event ingestion from channels;
- connector execution and retry logic;
- anomaly visibility and manual supervision support.

The HUB is the place where system truth is managed across channels and external systems.

### 2.3 Normalized Catalog Domain

The normalized catalog domain is the canonical internal representation of commercial objects.

It should represent at least:

- products;
- variants;
- media;
- categories;
- brands;
- commercial attributes;
- external mappings;
- publication-relevant states.

This domain must exist independently of WooCommerce-specific schemas.

### 2.4 Placement / Publication Domain

The placement/publication domain expresses **where and how** a product is exposed.

This includes:

- visible on public site or not;
- visible in search/listing or not;
- visible in homepage hero;
- visible in featured carousel;
- visible in collections or campaigns;
- published to ecommerce channel or not;
- date windows and optional ordering priority.

This domain is conceptually separate from the product itself.

### 2.5 WooCommerce Channel

WooCommerce should be treated as a **channel adapter target**, not as catalog authority and not as the editorial engine of the website.

Its role can include:

- hosting purchasable products for a legacy or transitional ecommerce flow;
- checkout/cart behavior if retained;
- order generation;
- webhook emission for order and product events;
- serving as a temporary or partial operational commerce backend.

Only products intended for the WooCommerce channel should be published there.

### 2.6 Public Frontend

The public frontend is the **customer-facing website** implemented using a modern stack such as Astro with React where needed.

Its responsibility is to:

- render SEO-critical pages as static or server-rendered HTML;
- display homepage sections driven by placements;
- render category, collection, landing, and product pages;
- display purchasable or informational products depending on publication state;
- avoid ownership of business rules that belong to the HUB.

The frontend should consume prepared data and rendering-oriented APIs, not become a second business engine.

***

## 3. Responsibility Boundaries

### 3.1 What belongs to Vetrina

Belongs to Vetrina:

- commercial content authoring;
- product-facing text and image management;
- publication intent;
- placement selection;
- homepage control;
- collection curation;
- scheduling and preview;
- lightweight publishing status visibility.

Does not belong to Vetrina:

- ERP synchronization logic;
- low-level connector configuration;
- fiscal execution;
- shipping execution;
- order workflow state machine ownership;
- webhook processing core.

### 3.2 What belongs to HUB Core

Belongs to HUB:

- canonical object persistence;
- external system mappings;
- publication state machine;
- channel synchronization jobs;
- order ingestion and operational workflow;
- structured audit and event handling;
- anomaly queues and retry mechanisms.

Does not belong to HUB:

- direct public content rendering;
- customer-facing page layout logic;
- a generic WYSIWYG page-builder role.

### 3.3 What belongs to the Frontend

Belongs to frontend:

- presentation composition;
- UX/UI rendering;
- SEO markup output;
- route generation;
- customer interactions.

Does not belong to frontend:

- publication policy decisions;
- product governance truth;
- connector execution;
- operational workflow decisions.

***

## 4. Core Conceptual Separation

The architecture depends on preserving four distinct concepts.

### 4.1 Product Existence
A product exists as a commercial object in the normalized catalog.

### 4.2 Public Visibility
A product may be visible on the public website.

### 4.3 Placement Presence
A product may be shown in one or more specific promotional surfaces.

### 4.4 Ecommerce Purchasability
A product may or may not be purchasable online through a given channel.

These must never be collapsed into one boolean state.

A single product may be:

- present in catalog,
- visible on site,
- featured in hero,
- absent from listing,
- not purchasable online,
- included in a seasonal collection.

That flexibility is one of the architecture's main commercial strengths.

***

## 5. Logical Data Flow

### 5.1 Product Authoring Flow

1. A user creates or edits product-facing content in Vetrina.
2. Vetrina sends the intent to the HUB API.
3. The HUB validates and persists the normalized product object.
4. The HUB persists publication and placement decisions separately from the core product object.
5. The frontend consumes the resulting published view model.

### 5.2 Channel Publication Flow

1. A product is marked for ecommerce publication.
2. The HUB evaluates target channel readiness.
3. A channel publication job is generated.
4. The WooCommerce connector performs upsert/update actions.
5. Publication result is recorded in HUB state and surfaced back to Vetrina.

### 5.3 Homepage / Placement Flow

1. A user toggles hero/carousel/featured visibility in Vetrina.
2. Vetrina submits placement intent to HUB.
3. HUB stores placement assignments and ordering metadata.
4. Frontend homepage APIs fetch current active placements.
5. Astro frontend renders those placements into HTML output.

### 5.4 Order / Event Flow

1. A customer purchases through the ecommerce channel.
2. WooCommerce emits webhook events.
3. HUB ingests the event and resolves tenant, channel, and external references.
4. HUB creates or updates the normalized order record.
5. HUB triggers downstream operational logic such as shipment, invoice, receipt, or anomaly handling.
6. Supervisor-facing UI surfaces the operational state.

***

## 6. Publication Model

The publication model should be explicit and multi-dimensional.

### Recommended state dimensions

For each product, the system should support at least the following independent dimensions:

- catalog_status
- site_visibility
- listing_visibility
- ecommerce_enabled
- hero_featured
- carousel_featured
- collection_membership
- publish_start_at
- publish_end_at
- channel_sync_status

This avoids overloading a single “published” field with multiple meanings.

***

## 7. API Boundary Philosophy

The API design should follow boundary-oriented thinking.

### Vetrina-facing APIs
These APIs are optimized for business editing and publishing operations.

Examples:

- create/update product presentation record;
- assign placements;
- set publication toggles;
- create/update collections;
- request preview models;
- inspect channel sync status.

### Frontend-facing APIs
These APIs are optimized for read performance and rendering clarity.

Examples:

- homepage model endpoint;
- collection page model endpoint;
- product page model endpoint;
- navigation/category model endpoint;
- SEO metadata payload;
- structured data payload.

### Connector-facing APIs / jobs
These are internal and operational.

Examples:

- publish product to WooCommerce;
- reconcile product publication state;
- ingest order webhook;
- retry failed publication job.

These concerns should not be blended into one generic API surface.

***

## 8. Why WooCommerce Must Be Demoted To Channel Status

If WooCommerce remains both:

- product store,
- homepage editor,
- taxonomy owner,
- frontend engine,
- order system,
- and editorial source,

then the architecture collapses back into the same monolithic constraints the redesign is meant to escape.

Demoting WooCommerce to channel status provides several advantages:

- the public website can evolve independently;
- publication logic can become richer than WooCommerce visibility flags;
- non-purchasable promotional products become first-class citizens;
- homepage composition becomes independent from ecommerce admin constraints;
- future channel expansion becomes possible.

This is one of the most important product-shaping decisions.

***

## 9. SEO-Oriented Frontend Principles

The frontend architecture should preserve strong SEO behavior.

### Recommended principles

- SEO-critical pages should render meaningful HTML without depending on client-only fetch for essential content.
- Product, collection, category, and homepage routes should receive pre-shaped data from the HUB.
- Structured data should be generated from normalized product and collection models.
- Canonical URLs, metadata, headings, and breadcrumbs should be controlled centrally and predictably.
- Dynamic placements are acceptable as long as the resulting page output remains crawler-friendly.

The frontend should be dynamic in editorial control, not fragile in search rendering.

***

## 10. Product Shape Implications

This architecture implies a product suite rather than a single bloated application.

### Recommended shape

#### Vetrina
Commercial publishing surface.

#### HUB
Orchestration and systems control layer.

#### Public Frontend
Customer-facing storefront or site generated from HUB-managed published data.

This separation improves clarity, sellability, implementation discipline, and future modular pricing.

***

## 11. Suggested Initial Commercial Framing

For early commercial use, the architecture can be framed like this:

- **Vetrina** = manage what appears online, where, and when;
- **HUB** = synchronize and supervise what happens behind the scenes;
- **Frontend** = fast SEO-first website for customers;
- **WooCommerce** = optional transitional commerce channel.

This framing is easier for clients to understand than a purely technical “headless architecture” pitch.

***

## 12. Non-Goals At This Stage

To keep the architecture disciplined, the following should not be treated as mandatory in the first sellable version:

- full custom checkout replacement;
- advanced personalization engine;
- full page-builder abstraction;
- deep AI decision autonomy;
- complete ERP replacement;
- multi-region content architecture;
- generalized marketplace engine.

These may come later, but they should not distort the first product shape.

***

## 13. Summary Architecture Statement

The correct system model is:

- Vetrina expresses commercial publishing intent.
- HUB persists normalized truth, publication states, and operational flows.
- WooCommerce is one publishable commerce channel.
- The public frontend renders what the system has intentionally published.

This model preserves flexibility, improves SEO and frontend performance, and makes the solution more reusable and sellable than a WordPress-centered design.

## Next Document Candidates

After this file, the next most useful documents are:

1. `catalog-and-publication-data-model.md`
2. `deaneasy-seo-migration-and-rollout-plan.md`
3. `woocommerce-channel-adapter-spec.md`
4. `frontend-rendering-and-route-strategy.md`