# [PROJECT_NAME] — Product Architecture Document

**Version:** MVP  
**Status:** Plan (pre–Phase 1)  
**Last updated:** 2025-03-11

---

## 1. Technical Architecture Overview

### 1.1 High-Level Model

The platform is a **multi-tenant SaaS** where each **Shop** has:

- A **hosted storefront** at a canonical URL (e.g. `/[PROJECT_DOMAIN]/s/[shopSlug]`).
- An **embeddable storefront** at a dedicated route (e.g. `/[PROJECT_DOMAIN]/embed/s/[shopSlug]`) designed for iframe embedding on the shop’s existing website.
- A **merchant dashboard** (auth-protected) for managing profile, categories, products, and orders.
- Future: **native iOS/Android** clients that consume the same REST API.

All client types (hosted web, embed, PWA, future native) talk to **Next.js Route Handlers** under `app/api/...`. No business logic is locked inside Server Components or Server Actions only; core flows are exposed as JSON APIs for reuse by mobile apps and embeds.

### 1.2 Hosted vs Embeddable Storefront

| Aspect | Hosted storefront | Embeddable storefront |
|--------|-------------------|------------------------|
| **URL** | `/s/[shopSlug]` (or `/store/[shopSlug]`) | `/embed/s/[shopSlug]` |
| **Use case** | Standalone page, QR code, social links | Iframe on shop’s existing site |
| **Rendering** | Full Next.js page (layout, meta, PWA) | Minimal layout, no chrome; optional `?embed=1` or dedicated route |
| **Security** | Standard CSP | `Content-Security-Policy: frame-ancestors` to allow embedding on configured origins (or `*` for MVP) |
| **CORS** | Same-origin | Not needed for iframe (same-origin to our domain); API may need CORS if embed page is on different domain later |
| **Resize** | N/A | Consider `postMessage` or `ResizeObserver` for dynamic iframe height (Phase 2+) |

**Implementation approach:**

- One shared **storefront component tree** (profile, categories, products, cart, reserve).
- Two routes: one full page layout, one embed layout (minimal shell, same content).
- API calls from both use the same `fetch` to `app/api/...`.

### 1.3 Future Native App Support

- **API-first:** All mutations and reads go through `app/api/*` Route Handlers returning JSON.
- **Auth:** Use a token-based scheme (e.g. JWT or NextAuth with credentials + token) so native apps can send `Authorization: Bearer <token>`.
- **No Server Actions for core flows:** Reserve, add product, update order status, etc. are implemented as API routes so iOS/Android can call them directly.
- **Web and native share:** Same Prisma models, same API contracts, same image URLs (from your chosen storage).

---

## 2. Folder Structure (Proposed)

```
Showroom/
├── app/
│   ├── api/                    # REST-style API (Route Handlers)
│   │   ├── auth/
│   │   ├── shops/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── orders/
│   │   └── upload/
│   ├── (auth)/                 # Auth routes (login, register)
│   │   └── login/
│   ├── (dashboard)/            # Merchant dashboard (mobile-first)
│   │   └── dashboard/
│   ├── (storefront)/           # Public storefront routes
│   │   ├── s/[shopSlug]/       # Hosted storefront
│   │   └── embed/
│   │       └── s/[shopSlug]/   # Embeddable storefront
│   ├── layout.tsx
│   └── page.tsx                # Landing / marketing
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── dashboard/              # Merchant dashboard components
│   ├── storefront/             # Shared storefront (hosted + embed)
│   └── shared/                 # Buttons, forms, layout primitives
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # Auth helpers / session
│   ├── storage.ts              # Image upload (Supabase/Cloudinary client)
│   └── validations/            # Zod schemas for API
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── manifest.json           # PWA (Phase 2+)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SCAFFOLD.md
│   └── API.md                  # Optional: API reference
├── .env.example
├── .cursorrules
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Rationale:**

- **Route groups** `(auth)`, `(dashboard)`, `(storefront)` keep layouts separate without affecting URLs.
- **`app/api/`** is the single backend surface for web and future native.
- **`components/storefront/`** is shared between hosted and embed routes to avoid duplication.
- **`lib/`** holds DB, auth, storage, and validation so Route Handlers stay thin.

---

## 3. Image Upload Strategy (Free-Tier First)

### Recommendation: **Supabase Storage**

| Criteria | Supabase | Cloudinary |
|----------|----------|------------|
| Free tier | 1 GB storage, 2 GB bandwidth/mo | 25 GB storage, 25 GB bandwidth/mo |
| Setup | Same provider as optional DB; simple S3-like API | Separate service; robust image API |
| Auth | Row Level Security; service role for server uploads | API key + secret |
| URLs | Stable public URLs (CDN) | Stable CDN URLs + transforms |
| MVP fit | Very good if you use Supabase for nothing else or for DB later | Better if you need transforms/cropping from day one |

**Choice for MVP:** **Supabase Storage** — 1 GB is enough for hundreds of product images at moderate resolution; keeps “low/zero cost” and one less vendor. Use **Vercel Blob** only if you prefer to stay inside Vercel and accept a smaller free tier.

**Implementation outline:**

- **Server-only upload:** Merchant never gets Supabase keys. Next.js API route (e.g. `POST /api/upload`) accepts `multipart/form-data`, validates file (type, size), uploads to Supabase Storage via `@supabase/supabase-js`, returns **public URL** to store in `Product.imageUrl`.
- **Bucket structure:** e.g. `shops/{shopId}/products/{productId}_{timestamp}.jpg` so you can enforce quotas or purge by shop later.
- **Fallback:** If you prefer not to add Supabase at all for MVP, use **Vercel Blob** (or another Blob store) with the same API shape (`POST /api/upload` → return URL); swap to Supabase or Cloudinary when you need more capacity or transforms.

---

## 4. Core API Endpoints (MVP)

All under `app/api/`, returning JSON. Auth where noted = require merchant session (or token in future).

### Shops

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shops/[shopId]` | No | Public shop profile (for storefront). |
| GET | `/api/shops/me` | Yes | Current merchant’s shop. |
| PATCH | `/api/shops/me` | Yes | Update shop profile (name, slug, WhatsApp, address, etc.). |

### Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shops/[shopId]/categories` | No | List categories for storefront. |
| GET | `/api/shops/me/categories` | Yes | List categories (merchant). |
| POST | `/api/shops/me/categories` | Yes | Create category. |
| PATCH | `/api/shops/me/categories/[id]` | Yes | Update category. |
| DELETE | `/api/shops/me/categories/[id]` | Yes | Delete category (constraint: no products). |

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shops/[shopId]/products` | No | List products (filter by visibility: PUBLIC + optional token for PRIVATE_LINK). |
| GET | `/api/shops/[shopId]/products/[productId]` | No* | Single product (same visibility rules). *PRIVATE_LINK may require `?token=...`. |
| GET | `/api/shops/me/products` | Yes | List all products (merchant). |
| POST | `/api/shops/me/products` | Yes | Create product (title, price, categoryId, visibility, imageUrl from upload). |
| PATCH | `/api/shops/me/products/[id]` | Yes | Update product. |
| DELETE | `/api/shops/me/products/[id]` | Yes | Delete product. |
| POST | `/api/shops/me/products/[id]/private-link` | Yes | Generate short-lived shareable token for PRIVATE_LINK. |

### Upload

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload` | Yes | Multipart image upload; returns `{ url }` for `Product.imageUrl`. |

### Orders (Reservations)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shops/me/orders` | Yes | List orders (merchant); filter by status. |
| POST | `/api/shops/[shopId]/orders` | No | Create order (customer: name, phone, pickup time, items). |
| PATCH | `/api/shops/me/orders/[id]` | Yes | Update order status (Pending → Accepted → Completed). |
| GET | `/api/shops/[shopId]/orders/[id]` | No* | Order details (e.g. for confirmation page; optional token or id). |

### Auth (for dashboard)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Credentials or magic link; returns session/token. |
| POST | `/api/auth/register` | No | Register new shop + owner user. |
| POST | `/api/auth/logout` | Yes | Invalidate session. |
| GET | `/api/auth/session` | Yes | Current user/shop. |

---

## 5. Implementation Roadmap (5 Phases)

### Phase 1 — Foundation & Merchant Onboarding (Week 1)

- Project scaffold: Next.js, Tailwind, shadcn/ui, Prisma, env.
- DB: Run migrations from `schema.prisma`; optional seed for 1–2 shops.
- Auth: Simple credential-based auth (e.g. NextAuth Credentials or custom JWT) and session.
- Shops API: `GET/PATCH /api/shops/me`; minimal “Shop profile” form in dashboard.
- Dashboard shell: Layout and nav (mobile-first); “Profile” page wired to shops API.
- **Outcome:** Merchant can sign up, log in, and edit shop profile.

### Phase 2 — Categories & Products (Week 2)

- Categories API: CRUD under `/api/shops/me/categories`.
- Products API: Create/read/update/delete under `/api/shops/me/products`; list for storefront under `/api/shops/[shopId]/products` with visibility.
- Image upload: `POST /api/upload` → Supabase (or Vercel Blob); use returned URL in product.
- Dashboard UI: Categories management; **frictionless add-product flow** (camera/upload → title, price, category, visibility → publish).
- **Outcome:** Merchant can define categories and add products with photos in under a few minutes.

### Phase 3 — Public Storefront (Hosted + Embed) (Week 3)

- Storefront data: Consume `GET /api/shops/[shopId]`, `.../categories`, `.../products` from the app.
- Hosted route: `app/(storefront)/s/[shopSlug]/page.tsx` (resolve shop by slug; full layout).
- Embed route: `app/(storefront)/embed/s/[shopSlug]/page.tsx` (minimal layout, same components); set `frame-ancestors` (or allow all for MVP).
- UI: Shop header (name, WhatsApp, map link), categories, product grid, product detail; mobile-first.
- **Outcome:** Each shop has a live hosted page and an embeddable page; QR can point to hosted URL.

### Phase 4 — Reservations & Orders (Week 4)

- Orders API: `POST /api/shops/[shopId]/orders` (cart + customer info + pickup time); `GET/PATCH /api/shops/me/orders`.
- Storefront: “Reserve” flow (cart → name, phone, pickup time → submit); confirmation view.
- Dashboard: “Orders” tab; list and status actions (Pending / Accepted / Completed).
- **Outcome:** Customers can reserve for pickup; merchant sees and manages orders.

### Phase 5 — Private Links & Polish (Week 5)

- Visibility: Enforce `DRAFT` / `PRIVATE_LINK` / `PUBLIC` in storefront and API; `POST /api/shops/me/products/[id]/private-link` to generate token.
- Storefront: Support `?token=...` for PRIVATE_LINK product access.
- Multi-tenant: Ensure all APIs are scoped by `shopId`; no cross-shop data leak.
- PWA: Add `manifest.json`, optional service worker; “Add to Home Screen” ready.
- **Outcome:** MVP feature-complete; 3 beta shops can be onboarded; ready for QR and real-world testing.

---

## 6. Security & Multi-Tenancy (MVP)

- **Tenant isolation:** Every merchant API reads `shopId` from the authenticated user’s shop (or from path and validated against session). Never expose another shop’s data.
- **Storefront:** Only return products with `visibility: PUBLIC` or, when a valid `token` is provided, products with `visibility: PRIVATE_LINK` and matching token.
- **Upload:** Restrict to authenticated merchant; associate uploads with their `shopId` in path or metadata.
- **CORS / Embed:** For embed, restrict `frame-ancestors` as soon as you have a list of allowed origins; for API, allow your own origin; add others when you have a native app or third-party embeds.

---

## 7. Future-Proofing (Post-MVP)

- **Payments:** Add `Payment` (or `Transaction`) model and webhook route; keep `Order` as the source of truth; link payment to order.
- **Analytics & CRM:** Add events or logs (e.g. `Order`, `ProductView`) and export endpoints; back-office can be a separate app or dashboard section consuming the same API.
- **Native apps:** Reuse `app/api/*`; add token auth and optional push notifications (FCM/APNs) for new orders.
- **QR:** Storefront URL is stable; QR generation can be a simple dashboard action (link to hosted `/s/[shopSlug]` or a short domain later).

---

*End of Architecture Document. Proceed to `docs/SCAFFOLD.md` for setup commands and `prisma/schema.prisma` for the database schema.*
