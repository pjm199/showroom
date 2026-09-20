HUB Orchestrator Architecture — Level 1 (Engineering Overview)
This document describes the Level 1 architecture of a reusable, multi-tenant HUB orchestrator designed to supervise and coordinate flows between ERP systems, ecommerce platforms (such as WooCommerce), invoicing/fiscal systems, receipt systems, and shipping providers.

The intent is to serve as a foundational engineering brief, suitable as a starting point for an implementation in a modern TypeScript/Node.js stack, with strict quality, observability, and extensibility requirements.

1. Product Mission and Role in the Ecosystem
The HUB is not a point‑to‑point connector; it is a domain‑centric orchestration core.

In a typical deployment:

One or more ERP systems remain the primary source of record for products, pricing, inventory, and possibly customers.

One or more ecommerce channels (for example WooCommerce stores) expose the catalog to end customers and generate orders.

One or more fiscal systems handle electronic invoicing and receipts.

One or more shipping/logistics providers handle fulfillment and tracking.

The HUB orchestrator sits in the middle, normalizing data, supervising workflows, providing a unified operational UI, and recording audit trails.

Core responsibilities of the HUB:

Maintain an independent internal domain model for products, orders, workflows, and operations.

Orchestrate end‑to‑end order life cycles across channels and back‑office systems.

Provide a single operational console for human supervisors to review, approve, and override flows.

Enforce consistent business rules and configuration across heterogeneous systems.

Offer a clean connector pattern to add or replace ERP, ecommerce, fiscal, and shipping systems without redesigning the core.

2. Architectural Style
The recommended style for Level 1 is a modular monolith with explicit domain boundaries and asynchronous processing for integration‑heavy workloads.

Key characteristics:

Single deployable backend service, organized into loosely coupled domain modules rather than purely technical layers.

Clear separation between core domain and integration connectors.

Asynchronous job queues for webhooks, external API calls, and long‑running operations, backed by Redis and a robust job library such as BullMQ.

Central PostgreSQL database as the transactional store for the HUB domain.

Strong emphasis on observability (structured logs, correlation IDs, event tracing) and auditability (state histories, raw payload storage).

This pattern preserves the implementation simplicity of a monolith while allowing future extraction of specific modules (for example connectors, job workers) into independent services if and when needed.

3. High‑Level System Context
At a high level, the HUB sits between external systems and internal operators.

North‑bound:

Supervisor UI (for example React/Next.js/Vite app) consuming the HUB API.

Potential external systems using the HUB as a unified orchestration API.

South‑bound:

ERP adapters to read master data and write back operational outcomes.

Ecommerce adapters (WooCommerce and others) for catalog and orders.

Fiscal adapters (invoicing platforms, fiscal printers, receipt systems).

Shipping adapters (couriers, aggregators).

The HUB never delegates business decisions (for example whether to invoice or issue a receipt) to the ecommerce platform. Ecommerce platforms are treated as channels and UX surfaces, not as orchestration engines.

4. Core Domains
The HUB is structured around several core domains.

4.1 Catalog Domain
Responsibilities:

Represent products and variants in a normalized, channel‑agnostic form.

Maintain links between HUB products and external representations (ERP SKUs, WooCommerce product IDs, other ecommerce SKUs).

Coordinate publication and updates of catalog data to ecommerce channels via dedicated connectors.

Key concepts:

Product – internal product entity.

Variant – size, color, configuration variants.

External References – mapping between HUB entities and external IDs.

Channel Publications – status and metadata of catalog publication per channel.

4.2 Sales Domain
Responsibilities:

Ingest orders from ecommerce channels and internal UIs.

Maintain a HUB‑level order lifecycle, decoupled from external order states.

Store line items, pricing, taxation data, customer details, and payment summaries.

Key concepts:

Order – internal order aggregate.

Order Lines – line‑level detail referencing variants or free‑form items.

Status History – chronological status transitions for observability and audit.

External References – mapping back to ecommerce and ERP order IDs.

4.3 Workflow Domain
Responsibilities:

Model the operational workflow around an order: validation, shipping, invoicing, receipts, manual review, and similar tasks.

Represent these operations as tasks with explicit types, statuses, and linkage to orders.

Allow both automatic and human‑driven transitions, with full traceability.

Key concepts:

Workflow Instance – conceptual lifecycle attached to an order.

Tasks – atomic units of work (VALIDATION, SHIPPING, INVOICING, RECEIPT, MANUAL_REVIEW).

Task Transitions – state changes per task, with actor information.

Anomalies – exceptional conditions requiring supervision.

4.4 Integration Domain
Responsibilities:

Provide a consistent mechanism for receiving webhooks, verifying signatures, and persisting raw events.

Encapsulate outbound calls to external systems (ERP, ecommerce, fiscal, shipping).

Manage queues, retries, dead‑lettering, and idempotent processing of events.

Key concepts:

Webhook Deliveries – records of inbound events and processing status.

Integration Events – internal representation of significant domain events.

Outbox Messages – persisted outbound messages to be delivered to external systems.

Dead Letters – failed events requiring manual inspection.

4.5 Operational UI Domain
Responsibilities:

Expose a consolidated view of orders, tasks, anomalies, and integration status to human operators.

Provide action endpoints for operations such as “ship”, “invoice”, “issue receipt”, “block”, and “retry”.

Support filtering, sorting, and searching across orders and tasks.

5. Technology Stack (Baseline)
A pragmatic baseline stack for a technically demanding, integration‑heavy HUB:

Backend runtime – Node.js (LTS) with TypeScript.

Web framework – Express or Fastify for HTTP APIs and webhooks.

Database – PostgreSQL as primary transactional store.

ORM / schema management – Prisma.

Queues – Redis + BullMQ for background processing and retries.

Validation – Zod (or similar) for runtime validation of external payloads and configuration.

Logging – Pino (or similar) for structured JSON logs.

Observability – OpenTelemetry instrumentation as a later stage, with trace IDs propagated through jobs and external calls.

This stack balances maturity, developer productivity, and operational robustness for an orchestration platform.

6. Backend Project Structure
The backend should be organized around domains and connectors, not purely around layers.

Example structure:

text
src/
  app.ts
  server.ts

  config/
    env.ts
    logger.ts
    features.ts

  db/
    prisma.ts

  modules/
    auth/
    tenants/
    products/
    orders/
    workflows/
    tasks/
    anomalies/
    audit/
    configuration/

  connectors/
    woocommerce/
      wc.client.ts
      wc.products.ts
      wc.orders.ts
      wc.webhooks.ts
    erp/
      erp.client.ts
      erp.products.ts
      erp.stock.ts
      erp.orders.ts
    fiscal/
      invoice.client.ts
      receipt.client.ts
    shipping/
      shipping.client.ts

  services/
    product-sync.service.ts
    order-orchestrator.service.ts
    workflow-dispatcher.service.ts
    invoicing.service.ts
    receipt.service.ts
    shipping.service.ts

  queues/
    queue.ts
    jobs/
      process-webhook.job.ts
      publish-product.job.ts
      reconcile-order.job.ts
      create-shipment.job.ts
      create-invoice.job.ts
      create-receipt.job.ts

  lib/
    idempotency.ts
    signature.ts
    correlation.ts
    money.ts
    dates.ts
Rationale:

modules/* hold core domain logic and HTTP controllers.

connectors/* encapsulate all system‑specific code and external API calls.

services/* orchestrate multi‑step operations across domains and connectors.

queues/* and jobs/* provide asynchronous execution, retries, and clear separation between ingestion and processing.

lib/* centralizes cross‑cutting concerns such as idempotency, signature verification, correlation IDs, and monetary/date handling.

7. Multi‑Tenancy and Configuration
Even if initial deployments are one‑tenant‑per‑instance, the architecture must be tenant‑aware from day one.

Core principles:

Introduce a Tenant concept as a first‑class entity.

Store all connector configuration (credentials, endpoints, behavior flags) in tenant‑scoped configuration structures.

Avoid hard‑coded business rules; rule evaluation should be driven by configuration and, where necessary, per‑tenant policy code or rule engines.

Typical configuration areas:

Enabled channels (ERP, ecommerce, fiscal, shipping) per tenant.

Field mappings between ERP ↔ HUB ↔ ecommerce.

Catalog publication rules.

Policies governing when to invoice vs. issue a receipt vs. both.

Shipping rules and carrier selection heuristics.

Thresholds for blocking, anomaly detection, and manual review.

Retry policies and error‑handling strategies for each connector.

8. Connector Pattern
Connectors must be implemented behind clean, stable interfaces so that vendor‑specific details are fully isolated from the core domain.

Example interface contracts:

ts
interface CatalogPublisher {
  publishProduct(input: PublishProductInput): Promise<PublishProductResult>;
  updateProduct(input: UpdateProductInput): Promise<UpdateProductResult>;
  archiveProduct(input: ArchiveProductInput): Promise<void>;
}

interface SalesChannelReceiver {
  ingestOrder(event: ExternalOrderEvent): Promise<IngestOrderResult>;
}

interface InvoiceProvider {
  createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult>;
}

interface ReceiptProvider {
  createReceipt(input: CreateReceiptInput): Promise<CreateReceiptResult>;
}

interface ShipmentProvider {
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
}
Each concrete connector (for example WooCommerceCatalogPublisher, WooCommerceSalesReceiver, SomeERPClient, SomeFiscalSystemClient) implements these interfaces and is wired via configuration or dependency injection.

9. Order and Task Modeling (Conceptual)
A robust HUB distinguishes between the order aggregate and the tasks that must be completed for that order.

9.1 Order State
The HUB maintains its own internal order status, distinct from the ecommerce platform.

A reasonable starting set of internal statuses:

NEW

VALIDATED

AWAITING_DECISION

READY_TO_SHIP

SHIPPING_IN_PROGRESS

SHIPPED

INVOICE_PENDING

INVOICED

RECEIPT_PENDING

RECEIPT_ISSUED

FULFILLED

BLOCKED

CANCELLED

These statuses reflect the business process, not the state of any single external system.

9.2 Operational Tasks
Tasks represent units of work associated with an order.

Initial task types:

VALIDATION

SHIPPING

INVOICING

RECEIPT

MANUAL_REVIEW

Each task has its own status lifecycle (for example PENDING, READY, RUNNING, DONE, FAILED, BLOCKED, CANCELLED), and tasks can be processed by workers or human operators through the UI.

The workflow engine coordinates:

Task creation based on order properties, channel, tenant configuration, and business rules.

Task transitions triggered by external events (for example webhook confirmation) or human actions.

Order‑level status transitions derived from the status of associated tasks.

10. Webhook Ingestion Strategy
Webhook endpoints (for example WooCommerce order events) must be treated as ingestion points, not as locations to run full business workflows.

Recommended pattern:

Read the raw request body.

Validate the provider‑specific signature (for example HMAC header for WooCommerce).

Persist a WebhookDelivery record with raw payload, parsed JSON, headers, and metadata.

Respond with an appropriate HTTP status as quickly as possible.

Enqueue a job (for example process-webhook) for asynchronous processing.

All heavyweight operations—order creation, task spawning, connector calls—must occur in the background job context, not in the HTTP request handler. This is essential for resiliency and predictable behavior under retries.

11. Observability and Audit
A production‑grade HUB must be inspectable and explainable in the face of operational incidents.

Minimum requirements:

Structured logging with correlation IDs propagated through HTTP requests, jobs, and external calls.

Order status history and task transition history.

Persistent storage of webhook payloads and processing outcomes.

Audit logs for all manual actions performed through the UI.

Explicit dead‑letter queues for failed jobs, visible in an operational console.

These capabilities are crucial for support teams to reconstruct what happened when orders get stuck, connectors fail, or data in external systems appears inconsistent.

12. Level 1 Scope and Next Steps
Level 1 defines the architectural skeleton:

Role and responsibilities of the HUB in the system landscape.

Choice of architectural style (modular monolith) and core technologies.

Domain boundaries (catalog, sales, workflow, integration, UI).

Project structure and connector abstraction pattern.

Conceptual modeling of orders, tasks, and webhook ingestion.

Next levels should cover:

Detailed data model per domain (PostgreSQL + Prisma schemas).

Order state machine and task orchestration rules.

Connector contracts with concrete examples for WooCommerce, a reference ERP, and one fiscal plus one shipping provider.

REST API design for the Supervisor UI and external consumers.

Tenant configuration model and feature flagging.

This document is intentionally domain‑first, but technology‑ and vendor‑aware, so the HUB remains adaptable as integrations evolve.

Key Takeaways
ERP stays the data master, WooCommerce and others are channels, the HUB is the supervisor and orchestrator.

Modular monolith + queues gives you a NASA‑grade balance between robustness and evolvability.

Clean connector interfaces, internal order/task model, and webhook ingestion pattern are the three pillars that make this HUB reusable and sellable.

If you like this style, the natural next step is a Level 2 Markdown with the full data model (PostgreSQL + Prisma), still in English and at the same engineering depth.