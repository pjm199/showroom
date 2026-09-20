# HUB Orchestrator Platform Boundaries & Product Strategy (Addendum to Level 1)

This document refines the **Level 1 architecture** of the HUB orchestrator by making platform boundaries, product shape, and multi-tenant strategy explicit. It is written as a companion to the Level 1 engineering overview and intended for use in Cursor as a design reference.[cite:26][web:47]

---

## 1. Purpose of this Addendum

The Level 1 document defines a solid **engineering skeleton**: modular monolith, core domains, connector abstractions, and webhook/job patterns.[web:47][web:51] What it does not yet make explicit are:

- The **role of Showroom** (and similar apps) relative to the HUB core.  
- The **product shapes** you might adopt (single app vs suite vs platform).  
- The **tenant model** and permission boundaries, especially for agencies.  
- How to avoid **scope explosion** while still aiming beyond a simple MVP.[web:73][web:75]

This addendum addresses exactly those points, without changing the core technical direction.

---

## 2. Platform Layers and Boundaries

At a high level, the solution should be understood as three distinct layers:

1. **Core Orchestration Platform (the HUB)**  
   - Owns the **canonical domain model** (catalog, orders, workflows, integrations, audit).  
   - Provides **APIs**, **webhook endpoints**, **job processing**, and **tenant-scoped configuration**.  
   - Implements **connector interfaces** and manages external systems.[cite:26][web:47]

2. **Experience Applications (Apps)**  
   - Web and mobile clients that consume the HUB APIs.  
   - Examples: public storefronts, merchant self-service consoles, operator/supervisor consoles, partner portals.  
   - May live in the same repository as the core at first, but must not reach around the APIs into connector internals.[web:74]

3. **Connectors and Extension Surface**  
   - Implementation of `CatalogPublisher`, `SalesChannelReceiver`, `InvoiceProvider`, `ReceiptProvider`, `ShipmentProvider`, and similar interfaces.  
   - Future extension SDK for agencies and partners to implement and register connectors safely.[cite:26][web:53]

The **critical rule** is that only the Core Orchestration Platform directly integrates with external systems. Experience Applications talk to the core via **well-defined APIs** and share **auth + tenant context**, never by calling ERP or WooCommerce adapters directly.[web:47][web:74]

---

## 3. Product Shapes: How Showroom Fits

There are three coherent product shapes to consider. They are not mutually exclusive over time.

### 3.1 Shape A — HUB First, Showroom as Channel App

**Definition**  
- The HUB is the primary product and system of record.  
- Showroom is a **channel application**: a best-in-class storefront and merchant capture UI, built entirely on top of HUB APIs.

**Implications**  
- Cleanest separation of responsibilities: the HUB focuses on orchestration, Showroom on UX for one or more sales channels.[cite:26]  
- Easiest to explain to agencies: “Our HUB connects ERP, ecommerce, fiscal and shipping. Showroom is our flagship storefront experience built on top.”  
- Best long-term path if multiple third-party UIs or partner apps are expected.

### 3.2 Shape B — Showroom First, HUB Inside (Modular Monolith)

**Definition**  
- Showroom is the existing product.  
- The HUB core (domains, connectors, queues) is implemented **inside the same repository and deployment**, as part of a modular monolith.[web:47][web:74]

**Implications**  
- Fastest for one team: no forced split into separate services at the beginning.  
- Next.js app can host multiple “modes”: public storefront, merchant portal, operator console, under a shared platform layer.  
- Danger: if not carefully structured, merchant routes might bypass the HUB and call connectors directly, breaking the architecture.

**Mitigations**  
- Enforce a clear folder structure: `modules/`, `connectors/`, `queues/`, `lib/` as the **domain & platform layer**, and keep app routes as pure clients of the HUB API.  
- Treat the HUB as if it were a separate service, even if it lives in the same process.

### 3.3 Shape C — Platform Suite (Shared Core, Multiple Apps)

**Definition**  
- One **shared platform layer** (tenant, auth, audit, integrations, workflow engine).  
- Multiple applications: Showroom (storefront + merchant), Supervisor (operations console), Partner Portal (for agencies), and potentially more.

**Implications**  
- Strong packaging and branding story for agencies: a suite of apps on top of a single orchestration platform.  
- Requires more attention on deployment, routing, and permission models from the start.  
- This is the likely **end state** once the product matures and agencies onboard multiple tenants.

### 3.4 Recommended Path

Given the current state and goals:

- Start in **Shape B** (Showroom-first with HUB inside), but design the core as if heading toward **Shape C**.  
- That means: monorepo / monolith for now, but with rigorous module boundaries and a clear notion of a **platform layer** underneath the apps.[web:47][web:55]

---

## 4. Tenancy and Agency Model

A resellable HUB must be **multi-tenant at the platform level**, with a clear story for **agencies** and their **end merchants**.[web:73][web:75]

### 4.1 Tenant Definitions

There are two primary options for modeling agencies and their clients:

1. **Agency as tenant, clients as sub-accounts**  
   - Each agency is a top-level tenant.  
   - End merchants are modelled as sub-entities (e.g., `merchant` within `tenant`).  
   - The agency admin can see and manage all merchants under that tenant.

2. **Merchant as tenant, agency as operator across tenants**  
   - Each merchant is a tenant.  
   - The agency has operator accounts that can be granted access to multiple tenants.  
   - Cleaner isolation per merchant, but more complex access control.

Both are viable. For a **Hub orchestrator aimed at agencies**, option 2 is usually more scalable in terms of isolation, while option 1 may simplify billing; the decision must be explicit and reflected in the data model and auth system.[web:73][web:76]

### 4.2 Permission Matrix

At minimum, roles should cover:

- **Merchant Operator** – manages catalog and orders for a single merchant.  
- **Hub Operator** – supervises workflows, anomalies, and integrations at tenant scope.  
- **Agency Admin** – manages multiple merchants/tenants, sees aggregate health and usage.  
- **Read-only Auditor** – can inspect logs, status histories, and payloads without changing state.

Each API and UI surface must be designed with **role and tenant scope** as first-class parameters, not as afterthoughts.[web:75][web:73]

---

## 5. Scope Management: Avoiding Product Explosion

The ambition includes:

- ERP + ecommerce + shipping + fiscal + receipts.  
- Ticketing and support flows.  
- Agency billing, plans, usage metering.[cite:26]

This is **multiple products** in one roadmap. To keep the HUB coherent, treat these as sequenced verticals rather than a single amorphous scope.

### 5.1 Phase 1 — Harden the Platform Spine

Before adding more domains, the spine must be “boringly solid”:

- Tenants and roles.  
- Webhook ingestion → persistence → job → domain events, with idempotency.  
- Integration outbox and dead-letter handling.  
- Basic operator APIs for inspecting orders, tasks, and integration events.[web:9][web:77]

### 5.2 Phase 2 — One Vertical Slice End-to-End

Implement one **end-to-end slice** in production quality:

- WooCommerce order in via webhook.  
- HUB order + tasks created.  
- One shipping action executed via connector.  
- Status propagated back to channel (if needed).

This validates the **order + task model** and the integration patterns before adding more complexity.[web:6][web:9]

### 5.3 Phase 3 — Catalog Sync as a Second Path

Implement the catalog path:

- ERP (or master catalog) → HUB → channel publication.  
- Showroom can either consume the normalized catalog or mirror it with its own view.

### 5.4 Later Phases — Fiscal, Tickets, Agency Billing

- **Fiscal (Invoices, Receipts)** – model as operations driven by tasks and connectors; localize via “country packs” to avoid hardcoding all jurisdictional rules in one code path.[cite:26]  
- **Tickets** – model as specialized workflows and tasks and, optionally, connectors to external ticketing systems (e.g., Zendesk, Freshdesk).  
- **Agency Billing** – treat as a separate domain (**Platform Commercial**): plans, seats, API usage, per-connector pricing; do not mix with merchants’ fiscal documents.

---

## 6. Connector Discipline and Extension Story

Connectors are both a **technical mechanism** and a **product story**. Agencies will care about which systems are supported and how hard it is to add new ones.

### 6.1 Technical Discipline

- All external system calls must flow through well-defined interfaces (`CatalogPublisher`, `SalesChannelReceiver`, etc.).[cite:26]  
- Connectors should be stateless or nearly stateless, with configuration supplied from the platform (per tenant / per channel).[web:53]  
- Idempotency, rate limiting, and retry policies must be enforced at the platform level, not re-implemented per connector.[web:9]

### 6.2 Extension Story (SDK Direction)

Future documentation should outline:

- How a partner can implement a new connector safely.  
- How connectors are registered and configured per tenant.  
- How versioning and compatibility are managed when connectors evolve.

This is not part of Level 1 implementation, but the design must **leave space** for a connector SDK and marketplace narrative.

---

## 7. Operational Trust and Explainability

For agencies and enterprises, the differentiator is not only “we integrate X and Y,” but “you can trust this system in production.”[web:77][web:72]

Key aspects:

- **Traceability** – every order, task, and integration event must have a clear timeline and correlation ID.  
- **Replayability** – failed events should be replayable through the UI with safeguards.  
- **Inspectability** – raw payloads, mapped entities, and decision logs must be visible to operators (within tenant boundaries).  
- **Runbooks and SLOs** – while not code, the platform design must assume that hosted deployments will have incident response expectations and error budgets.[web:9][web:77]

These aspects should be reflected in future docs for APIs, data model, and job processing, not treated as afterthoughts.

---

## 8. Impact on the Five Level-2 Follow-ups

The previously defined five follow-up documents remain valid, but this addendum sharpens their focus.

1. **Data Model & Persistence (PostgreSQL + Prisma)**  
   - Must encode tenant relationships and role scoping explicitly.  
   - External references and connector configuration must be tenant-aware.

2. **Order State Machine & Operational Tasks**  
   - Should incorporate task types relevant to agency operations and clear transitions for manual vs automatic steps.[cite:28]

3. **Connector Contracts & Examples**  
   - Should document how contracts are tenant-scoped and how agencies can add or extend connectors.

4. **HUB API Design for Supervisor UI & External Consumers**  
   - Must integrate role/tenant context and expose enough data for explainability (timelines, events, payload references).

5. **Webhook & Job Processing (Ingestion, Idempotency, Retry, Dead Letters)**  
   - Should include multi-tenant concerns, rate limiting per connector/tenant, and UI hooks for operational recovery.[web:9][web:6]

---

## 9. Summary

- The Level 1 architecture is **technically sound**; this addendum clarifies the **product and platform boundaries** required for a professional, resellable HUB.[web:47][cite:26]  
- Showroom can function as a major UI surface on top of the HUB, provided the orchestration core remains cleanly separated and the system moves gradually toward a **platform with multiple apps**.  
- Multi-tenancy, permission models, connector discipline, and operational trust are not optional; they shape the data model, APIs, and roadmap for the next levels.[web:73][web:75]

This document should be read together with Level 1 before designing Level 2 data models or writing production code.