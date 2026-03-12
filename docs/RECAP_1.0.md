# Showroom — Version 1.0 (MVP) — Recap & Next Steps

**Version name:** **1.0** (MVP)  
**Snapshot date:** March 2025

---

## What’s in this version

### Auth & access
- Register, login, session-based auth.
- Dashboard protected; logged-in users hitting `/` redirect to `/dashboard`.

### Shops (merchant profile)
- **Profile:** Name, slug, description, logo, **WhatsApp**, address, **map URL**.
- Public shop page by slug; storefront at `/s/[slug]`.

### Categories
- CRUD in dashboard (Categories tab).
- Public category list by shop; used on storefront for filtering.

### Products
- CRUD in dashboard (Products tab); image upload via Vercel Blob (private; served via `/api/blob`).
- **Visibility:** Draft, **Private link**, Public.
- Public product list by shop slug; private blob URLs via `blobDisplayUrl()`.

### Orders & reservations
- **Storefront:** Cart (add/remove quantities), reserve form (name, phone, optional pickup time, notes) → POST order → redirect to `/s/[slug]/reserved?orderId=...`.
- **Dashboard:** Orders tab (first in nav); list with status filter (All, PENDING, ACCEPTED, COMPLETED, CANCELLED); actions: Accept, Complete, Cancel (Complete only when status is ACCEPTED).
- **Polling:** Orders list refreshes every 30s and on tab focus (no WebSocket yet).
- **Strategy:** No automatic notifications; merchant informs customer (e.g. WhatsApp) when accepting, completing, or cancelling. See `docs/ORDERS_AND_NOTIFICATIONS_STRATEGY.md`.

### Private storefront link (1.0)
- **Profile:** “Share link” card: generate 7-day link, copy URL.
- Storefront and products API accept `?token=...`; valid token shows **PUBLIC + PRIVATE_LINK** products; customers can place orders via that link.

### Storefront UX
- **Header:** Amber palette; gradient bar; shop name; “Reserve for pickup”; **WhatsApp** button (icon + formatted phone, `wa.me` link); **Map** button (map URL); address (link if map URL set).
- **Footer:** Shop name, address, “Contact via WhatsApp”, “Get directions”, “Showroom — Reserve for pickup” credit.
- **Back link:** Owner → “Back to Dashboard” (to Orders); others → “Back to Showroom” (`/`). Owner hint: “You’re viewing your storefront as customers see it.”
- **Products:** One card per row; category filter chips; golden-ratio styling; quantity +/-; responsive (horizontal card on `sm+`).

### Dashboard UX
- `/dashboard` redirects to `/dashboard/orders`.
- Nav tabs: **Orders**, Categories, Products, Storefront (larger `text-base`).
- Profile as header button between “Dashboard” and Sign out.

### Tech
- Next.js App Router, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL.
- API-first (`app/api/...`) for future native/mobile.
- Golden ratio in Tailwind (`aspect-golden`, `rounded-[1.618rem]` etc.).

---

## Next To Do (2.0 and later)

| Priority | Area | To do |
|----------|------|--------|
| 1 | **Real-time orders** | WebSocket (or similar) so Orders tab updates without polling; optional push notifications for new orders. |
| 2 | **Embeddable storefront** | Route `/embed/s/[slug]` with minimal layout for iframe; CSP `frame-ancestors`; reuse storefront components. |
| 3 | **PWA** | manifest.json + optional service worker; “Add to Home Screen” for merchants. |
| 4 | **Per-product private link** | Short-lived link for a single PRIVATE_LINK product; API to create token per product. |
| 5 | **QR & share** | Dashboard: “QR code” for storefront URL; optional short domain/short links. |
| 6 | **Payments (optional)** | Stripe (or similar) for deposit/full payment at reservation; link to Order. |
| 7 | **Analytics & exports** | Order/product view events; dashboard or API to export orders (CSV/Excel) by date range. |
| 8 | **Native app readiness** | Token/JWT auth for API; FCM/APNs for new orders in future native app. |

Details and more ideas: `docs/ROADMAP_2.0.md`.

---

## Docs in this repo

- **RECAP_1.0.md** (this file) — What’s in 1.0 and what’s next.
- **ROADMAP_2.0.md** — 2.0 features and summary table.
- **ORDERS_AND_NOTIFICATIONS_STRATEGY.md** — Order flow and notification strategy.
- **Phase_2_STEPS.md** — Earlier phase notes.
