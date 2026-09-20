# Vetrina v2 — Product Structure, Boundaries, Modules, and Functional Backlog

Vetrina v2 should be defined as a **commercial publishing console** and not as a generic CMS, not as an orchestration engine, and not as a supervisor dashboard.[cite:2][cite:45][cite:47] Its role is to let a business create, enrich, organize, publish, and visually compose its commercial presence across public storefronts, B2B catalogs, dynamic sections, and selected sales channels from a single controlled interface.[cite:84][cite:83][cite:85]

## Strategic definition

The strongest positioning for Vetrina is this: it is the place where the merchant or operator decides what should be shown, where it should be shown, to whom, and in what order.[cite:84][cite:2] HUB remains responsible for cross-system orchestration, workflow state, anomaly management, audit, and integrations such as WooCommerce, Bikesolution, Aruba, and other external systems.[cite:1][cite:62][cite:63] The public storefront rebuilt in Next.js becomes the experience delivery layer that renders the commercial model defined by Vetrina and the canonical/operational data exposed by HUB or the shared backend backbone.[cite:82][web:38][web:67][web:73]

This separation matches common headless and composable architecture patterns, where content/presentation composition is separated from backend workflows and from the frontend rendering layer.[web:38][web:71][web:80][web:93] It also aligns with the previously defined architecture in which Vetrina governs content and publishing, HUB governs rules and flows, and the public frontend renders the result.[cite:8][cite:28][cite:45]

## Product mission

The mission of Vetrina v2 is to give a merchant, agency, or store operator a mobile-friendly control surface to:

- create and enrich products and commercial assets;[cite:84][cite:83]
- control publication toward public storefronts, B2B catalogs, and selected channels;[cite:83][cite:85]
- compose dynamic pages and sections such as hero, carousel, featured grids, collections, promo banners, and landing blocks;[cite:84][web:90][web:95]
- build an owned digital presence that behaves more like a controlled commercial social feed than a static website;[cite:84][cite:2]
- support B2B and custom-order scenarios without turning Vetrina into the orchestration core.[cite:64][cite:1]

## Product boundaries

### What Vetrina **is**

Vetrina is:

- a commercial authoring and publishing console;[cite:2][cite:84]
- a placement and merchandising system;[cite:45][cite:47]
- a B2B catalog and offer presentation layer;[cite:64]
- a section-based site composition tool for the public storefront;[cite:84][web:86][web:93]
- a channel-intent manager, meaning it expresses the business intent to publish something to a target, while execution may be delegated to HUB in the full architecture.[cite:83][cite:85]

### What Vetrina is **not**

Vetrina is not:

- the owner of cross-system workflows;[cite:1][cite:63]
- the place where Aruba/Bikesolution/Winscontrino/shipping process logic is executed;[cite:1][cite:62]
- the anomaly engine for operational exceptions;[cite:1][cite:63]
- the supervisor dashboard for approvals, retries, or technical monitoring;[cite:1][cite:4]
- an unrestricted page builder like WordPress/Elementor; section-based composition is the right model, not arbitrary page mutation.[web:90][web:96]

## Core product modules

Vetrina v2 should be structured into four primary modules and two supporting modules. This keeps the system rigorous while still matching the user vision already expressed in prior architecture work.[cite:45][cite:47][cite:84]

### 1. Product Manager

This module manages the commercial product layer: the product as it must appear and be curated for publication, not necessarily the full ERP-grade operational truth.[cite:84][cite:47]

Main responsibilities:

- create and edit products;
- manage titles, descriptions, short copy, media, badges, highlights, attributes relevant to presentation;
- manage variant-facing content useful for display;
- define visibility and readiness for publication;
- associate products to categories, brands, collections, and placements.[cite:47][cite:84]

This module may read canonical data from HUB or another backbone in advanced configurations, but Vetrina remains the place where the commercial representation is enriched and prepared for publication.[cite:1][cite:82][cite:84]

### 2. Publication Manager

This module manages publication intent and placement targets.[cite:83][cite:85] It determines whether a product or collection should appear on the public storefront, in a B2B catalog, in a widget, in a promotional section, or in an ecommerce channel.[cite:83][cite:84]

Main responsibilities:

- publication toggles per target;
- desired publication state;
- scheduling and expiry windows;
- visibility by audience or business context;
- publish/unpublish workflows;
- draft, preview, and go-live management.[web:86][web:87][web:93]

The critical rule remains: Vetrina can express the intent to publish to WooCommerce or another channel, but in the full architecture it should not execute the technical synchronization directly; HUB and its adapters own the technical conversation and resulting sync state.[cite:83][cite:1]

### 3. B2B Catalog Manager

This module should become one of the strongest differentiators of Vetrina.[cite:64] It supports dedicated catalog experiences for professional clients, custom offers, segmented visibility, and order/request collection where appropriate.[cite:64][cite:84]

Main responsibilities:

- build B2B-only catalogs;
- define customer- or segment-specific selections;
- manage private or semi-private visibility;
- attach notes, terms, custom messaging, or sales conditions;
- support request-for-order or direct-order flows where already enabled in the product vision.[cite:64]

This keeps Vetrina valuable even in projects where the full HUB orchestration is sold later as an upgrade.[cite:85]

### 4. Site Composer

This should be implemented as an internal Vetrina module, not as a separate fifth product at this stage.[cite:84][cite:85] The right model is a **section-based composition system** aligned with visual headless CMS patterns, where a page is a sequence of typed blocks with order, configuration, and visibility rules.[web:86][web:90][web:93][web:94]

Main responsibilities:

- manage pages such as homepage, landing pages, collection pages, category pages, and lightweight commercial pages;[cite:84][web:88]
- manage sections such as hero, carousel, featured products, product grids, banners, collections spotlight, CTA strips, testimonial/reassurance modules, and brand blocks;[web:90][web:95]
- reorder sections;
- enable/disable sections;
- choose a section variant;
- bind products, collections, rules, or media to a section;
- define simple display logic, such as “show this only for B2B”, “only during campaign X”, or “only when inventory condition Y is satisfied if exposed by backend data”.[web:93][web:95]

This module should save structured layout configuration rather than free HTML or arbitrary visual freedom.[web:90][web:96] The public Next.js storefront then maps each stored section type to its corresponding React component and renders the page dynamically.[web:67][web:73][web:93]

### 5. Media & Asset Manager

A supporting module is needed to keep the experience practical from mobile and fast in real use.[cite:65][cite:84] It should manage cover images, hero images, product images, badges, promotional assets, and reusable media bundles for sections and campaigns.[web:95]

Main responsibilities:

- upload and organize media;
- associate media to products, pages, collections, and sections;
- define primary/secondary image usage;
- manage lightweight alt text and image metadata for publication.

### 6. Preview & Release Manager

A second supporting module should make authoring safe and professional.[web:86][web:87] Without this, dynamic publishing becomes dangerous in production.

Main responsibilities:

- draft state;
- preview state;
- scheduled publication;
- rollback or previous version restore;
- simple publication history for commercial changes.[web:86][web:93]

## Functional domains

The cleanest conceptual split inside Vetrina is this:

| Domain | Purpose | Owns | Must not own |
|---|---|---|---|
| Product Authoring | Commercial product enrichment | titles, descriptions, display media, selling highlights, presentational attributes [cite:84][cite:47] | workflow orchestration, sync engine [cite:1] |
| Publication | Intent and visibility control | publish targets, timing, audience visibility, draft/published state [cite:83][web:93] | external adapter execution [cite:83] |
| B2B Catalog | Professional cataloguration and order/request exposure | catalog composition, segment visibility, B2B presentation [cite:64] | multi-system order workflow [cite:1] |
| Site Composer | Page/section composition | section order, variants, page composition, placements [cite:84][web:90] | raw unrestricted page builder behavior [web:96] |
| Media | Asset management | images, visual assets, associations [cite:65] | technical delivery/CDN logic |
| Preview/Release | Safe publishing process | preview, schedule, rollback [web:86][web:93] | runtime rendering logic |

## Recommended feature structure

### MVP core

The MVP core of Vetrina v2 should include only the features required to prove the product promise strongly and coherently.[cite:45][cite:46]

#### Product Manager MVP

- Create product
- Edit product
- Upload product media
- Assign categories/brands/collections
- Set visibility status
- Mark product as ready/not ready for publication
- Attach product to featured sections or B2B lists[ cite:84][cite:47]

#### Publication Manager MVP

- Publish/unpublish to public storefront
- Publish/unpublish to B2B catalog
- Publish/unpublish to promotional sections
- Publication toggle per target
- Draft vs published state
- Basic preview[ cite:83][cite:85]

#### B2B Catalog Manager MVP

- Create catalog
- Add/remove products
- Reorder products
- Set B2B-only visibility
- Basic request/order action if already part of the existing model[ cite:64]

#### Site Composer MVP

- Homepage composition
- Hero section
- Carousel section
- Featured products grid
- Promo banner section
- Collection highlight section
- Section enable/disable
- Section reorder
- Bind products/collections/media to each section[ cite:84][web:90][web:95]

#### Media MVP

- Media library
- Product images
- Hero and banner uploads
- Reuse media across pages and sections

#### Preview/Release MVP

- Preview page
- Save draft
- Publish now
- Unpublish[web:86][web:87]

### Premium layer

The premium layer can justify upsell and stronger differentiation.

- Audience-based visibility rules;[web:93][web:95]
- Scheduled campaigns;
- section variants and A/B-ready variants;
- page templates for Home, Category, Promo, Brand, Seasonal, B2B;
- advanced collection rules;
- reusable page fragments;
- localized content variants;
- richer preview flows;
- approval workflow for content changes in multi-user accounts.[web:86][web:90][web:93]

### Future layer

The future layer is powerful but should not be in the first implementation unless a client pays for it specifically.

- fully visual editor overlays;
- AI-assisted section suggestions;
- rule-based auto-merchandising;
- per-segment dynamic homepage assembly;
- visual experimentation engine;
- omnichannel campaign orchestration integrated with HUB state signals.[cite:26][web:90]

## Section-based site composition model

The strongest implementation model for the site layout inside Vetrina is a section-based structure rather than page-builder freedom.[web:86][web:90][web:96] This means every page is built from an ordered list of sections with typed configuration.

A clean conceptual model would include:

- Page
- PageVersion
- SectionInstance
- SectionType
- SectionOrder
- SectionVisibilityRule
- SectionContentBinding
- SectionVariant
- PagePublicationState[web:93][web:94]

A homepage might then be composed like this:

1. Hero section
2. Promo strip
3. Carousel of featured products
4. Seasonal collection grid
5. B2B catalog callout
6. Brand reassurance section
7. CTA footer block

This directly matches the user vision of moving hero above or below a carousel without touching code.[cite:84]

## Rules for keeping Vetrina healthy

To prevent Vetrina from becoming a bloated or confused system, the following non-negotiable product rules should be fixed now:

1. Vetrina controls presentation and publication, not orchestration.[cite:1][cite:45]
2. Vetrina may express publication intent to channels, but technical execution belongs to HUB/adapters in the full architecture.[cite:83][cite:1]
3. Vetrina may have a lightweight standalone mode without HUB for smaller projects, but the enterprise/full version must preserve the same conceptual boundaries.[cite:85]
4. Site composition must be structured and section-based, never a free-form “anything anywhere” builder.[web:90][web:96]
5. Public storefront rendering belongs to the frontend layer (Next.js), not to Vetrina runtime rendering.[cite:82][web:67][web:73]
6. Operational exceptions, retries, approvals, and audit-critical actions belong to HUB and Dashboard, not to Vetrina.[cite:1][cite:62][cite:63]

## Two operating modes

The product can realistically support two operating modes, which is commercially important.[cite:85]

| Mode | Components | Vetrina role |
|---|---|---|
| Base mode | Vetrina + Frontend/storefront | commercial authoring, product publishing, site composition, B2B catalog, light channel publishing [cite:85][cite:84] |
| Full mode | Vetrina + HUB + Dashboard + Frontend/storefront | same authoring role, but channel execution, state tracking, operational workflows, anomalies, audit, and approvals are delegated to HUB/Dashboard [cite:1][cite:82][cite:85] |

This is important because it makes Vetrina sellable both as a standalone product and as part of the larger HUB ecosystem.[cite:85][cite:44]

## Functional backlog by module

### Product Manager backlog

- Product CRUD
- Variant-facing display fields
- Media gallery
- Category and brand assignment
- Collection membership
- merchandising tags
- product badges
- presentation notes
- display status
- publication readiness score
- duplicate product / clone product
- archive product
- search and filters for large catalogs[ cite:47][cite:84]

### Publication Manager backlog

- Publish target matrix
- Toggle publication target on/off
- desired state vs actual sync state
- publish now / unpublish now
- schedule publish/unpublish
- audience restrictions
- storefront visibility rules
- widget visibility rules
- B2B-only visibility
- publish history[ cite:83][cite:85][web:93]

### B2B Catalog Manager backlog

- B2B catalog CRUD
- customer segment catalogs
- private catalog links or access policies
- price-list attachment model
- catalog notes and cover content
- request for quote / request order action
- direct B2B order option where enabled
- catalog reorder tools
- export/share options for commercial use[ cite:64]

### Site Composer backlog

- page CRUD for commercial pages
- page templates
- section library
- section ordering
- section duplication
- section enable/disable
- product/collection binding
- section variant selection
- campaign banners
- hero builder
- carousel builder
- featured grid builder
- CTA strips
- promo cards
- brand showcase
- mobile preview hints
- homepage versioning[ cite:84][web:90][web:95]

### Media & Asset backlog

- media library search
- image tagging
- crop/focal point metadata
- alt text field
- image reuse suggestions
- hero and banner presets
- campaign asset grouping
- replace asset without breaking bindings

### Preview & Release backlog

- draft mode
- preview URLs
- scheduled release
- rollback
- publication log
- simple version history
- compare versions
- restore previous version[web:86][web:87]

## Recommended data concepts

Even before the technical schema is written, the product structure suggests the following entities and conceptual groups:[cite:45][cite:47]

- Product
- ProductVariantView
- ProductMedia
- Brand
- Category
- Collection
- PublicationTarget
- PublicationIntent
- Page
- PageVersion
- SectionInstance
- SectionType
- SectionVariant
- SectionBinding
- AudienceRule
- B2BCatalog
- B2BCatalogItem
- MediaAsset
- PublishEvent
- PreviewSnapshot
- ReleaseRecord

These concepts align with the already discussed catalog/publication architecture and give a strong base for later PostgreSQL/Prisma modeling.[cite:45][cite:47]

## Product positioning

The commercial positioning should remain sharp: Vetrina is not “a new website builder” and not “another CMS”.[cite:45][cite:65] It is a mobile-first commercial publishing console that lets a business update products, compose dynamic selling pages, activate B2B catalogs, and feed a modern storefront without depending on a webmaster for every change.[cite:2][cite:84][cite:85]

This is a much stronger position than generic CMS language because it is specific, operational, and tied directly to merchant pain points already present in the project vision.[cite:2][cite:65]

## Recommended next documents

After fixing this structure, the most logical next documents are:

1. `vetrina-v2-domain-data-model.md` — entities, fields, relations, and boundaries for Product, Publication, B2B Catalog, Site Composer, Media, and Preview domains.[cite:45][cite:47]
2. `vetrina-v2-user-roles-and-permissions.md` — merchant, editor, sales operator, B2B manager, admin, approver.[web:35]
3. `vetrina-v2-api-contract.md` — frontend and internal API contracts for Next.js storefront and HUB integration.[cite:82][cite:83]
4. `vetrina-v2-site-composer-spec.md` — detailed structure for pages, sections, variants, bindings, and preview logic.[web:90][web:93][web:94]

## Final architectural conclusion

The right decision at this stage is to keep site layout management inside Vetrina as a rigorously bounded module called Site Composer.[cite:84][cite:85] This preserves product coherence, keeps the UX unified for mobile-friendly commercial management, and avoids premature fragmentation into too many products or domains.[cite:2][cite:44] The core rule is simple: Vetrina authors and composes, the storefront renders, HUB orchestrates, and Dashboard supervises.[cite:1][cite:82][cite:84]
