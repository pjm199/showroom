# Showroom — Roadmap & Version 2.0 Plan

**Last updated:** 2025-03  
**Current milestone:** MVP 1.0 complete (Phases 1–4 + UX polish)

---

## Milestone: MVP 1.0 (Current)

The following is in place and considered the baseline for “1.0”:

- **Auth:** Register, login, session; dashboard protected by auth.
- **Shops:** Profile (name, slug, description, logo, WhatsApp, address, map URL); public shop by slug.
- **Categories:** CRUD for merchant; public list by shop slug.
- **Products:** CRUD, image upload (Vercel Blob), visibility Draft / Private link / Public; public product list by shop slug; private blob images served via `/api/blob`.
- **Storefront:** Hosted at `/s/[slug]`; shop header, product grid, add-to-reservation (cart), reserve form, confirmation page; “Back to Dashboard” when owner is logged in.
- **Orders:** Create order from storefront (customer name, phone, pickup time, notes); dashboard Orders tab first; list, filter by status, Accept / Complete / Cancel; **polling every 30s + refetch on tab focus** for new orders (no WebSocket yet).
- **Private storefront link (1.0):** Merchant generates a share link (Profile) valid 7 days; clients with that link see PUBLIC + PRIVATE_LINK products and can place orders.
- **UX:** Logged-in users redirect from home to dashboard; Orders as dashboard home; Profile in header button; navbar tabs (Orders, Categories, Products, Storefront) with improved styling and larger font.

**Deferred to “improve later” (see 2.0):**

- Real-time order updates (WebSocket or push) so new orders appear without polling.
- Optional: browser push notifications for new orders.

---

## Version 2.0 — Planned Features

### 1. Real-time & notifications

- **Real-time Orders:** Replace or complement polling with WebSockets (e.g. Pusher, Ably, or custom Socket.io/Next.js API) so the Orders tab updates as soon as a customer places an order.
- **Push notifications (optional):** Browser push or PWA for “New order” when the merchant is not on the Orders tab.

### 2. Per-product private links (Phase 5 carryover)

- **Per-product share token:** Optional per-product short-lived link (e.g. single product shared via WhatsApp). Storefront supports `?token=...` for a single PRIVATE_LINK product.
- **API:** `POST /api/shops/me/products/[id]/private-link` to create short-lived token for one product.

### 3. Embeddable storefront

- **Route:** `/embed/s/[slug]` with minimal layout (no full site chrome) for iframe use on shop’s website.
- **Security:** `Content-Security-Policy: frame-ancestors` (allow list or `*` for MVP).
- Reuse existing storefront components; optional dynamic iframe height (e.g. ResizeObserver / postMessage).

### 4. PWA & “Add to Home Screen”

- **manifest.json** and optional service worker; installable on mobile so merchants can open dashboard like an app.

### 5. Payments (optional)

- **Payment model / webhook:** Link payments to orders; keep Order as source of truth.
- Integrate Stripe (or similar) for deposit or full payment at reservation.

### 6. Analytics & exports

- **Events:** e.g. Order created, Product view (storefront); store in DB or log.
- **Exports:** Dashboard section or API to export orders (CSV/Excel) for a date range.

### 7. QR & share

- **Dashboard:** “QR code” action that links to hosted storefront `/s/[slug]` (or short URL later).
- Optional: short domain or short links for storefront URLs.

### 8. Native app readiness

- **Token auth:** JWT or session token for API so iOS/Android can reuse `app/api/*`.
- **Push:** FCM/APNs for new orders in a future native app.

---

## Summary

| Area              | 1.0 (done)                         | 2.0 (planned)                          |
|-------------------|------------------------------------|----------------------------------------|
| Orders updates    | Polling 30s + tab focus            | WebSocket / push; optional notifications |
| Product visibility| Draft / Public                     | PRIVATE_LINK + shareable token         |
| Storefront        | Hosted `/s/[slug]`                 | + Embed `/embed/s/[slug]`              |
| Install           | —                                  | PWA, manifest                          |
| Payments          | —                                  | Optional Stripe / webhook              |
| Analytics         | —                                  | Events + exports                       |
| QR / share        | Manual link                        | QR action, optional short URL          |

Use this document to prioritize and scope the next iteration (2.0) and beyond.
