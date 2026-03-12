# Phase 2 — Categories & Products (step-by-step)

## Step 1: Categories API ✅

**Done.**

- **GET** `/api/shops/me/categories` — List categories for the current shop (ordered by sortOrder, then createdAt). Each item includes `productCount`.
- **POST** `/api/shops/me/categories` — Create category. Body: `{ "name": "string", "sortOrder": number? }`.
- **GET** `/api/shops/me/categories/[id]` — Get one category.
- **PATCH** `/api/shops/me/categories/[id]` — Update. Body: `{ "name": "string?", "sortOrder": number? }`.
- **DELETE** `/api/shops/me/categories/[id]` — Delete. Returns 400 if the category has products (move or delete products first).

All routes require an authenticated merchant; categories are scoped to the merchant’s shop.

**Validation:** `lib/validations/category.ts` (name required, max 100 chars; sortOrder optional, non‑negative).

---

## Step 2: Dashboard Categories UI ✅

- New page: **Dashboard → Categories**.
- List categories (mobile-friendly), add new, edit name, delete (with product-count warning).
- Nav: add “Categories” link in dashboard.

---

## Step 3: Products API ✅

**Done.**

**Merchant (auth required):**
- **GET** `/api/shops/me/products` — List all products (with categoryName). Ordered by sortOrder, createdAt.
- **POST** `/api/shops/me/products` — Create. Body: `title`, `priceCents`, `description?`, `categoryId?`, `imageUrl?`, `visibility?` (DRAFT|PRIVATE_LINK|PUBLIC), `sortOrder?`.
- **GET** `/api/shops/me/products/[id]` — Get one.
- **PATCH** `/api/shops/me/products/[id]` — Update (same fields as create, all optional).
- **DELETE** `/api/shops/me/products/[id]` — Delete.

**Public (no auth):**
- **GET** `/api/shops/[shopId]/products` — List PUBLIC products by shop id.
- **GET** `/api/shops/slug/[slug]/products` — List PUBLIC products by shop slug (for storefront /s/[slug]).

**Validation:** `lib/validations/product.ts` (title required, priceCents ≥ 0, visibility enum; categoryId validated against shop).

---

## Step 4: Dashboard Products + Add product flow ✅

**Done.**

- **Nav:** “Products” link in dashboard.
- **List** (`/dashboard/products`): All products with image, title, price (€), category, visibility badge (PUBLIC/DRAFT). Edit (pencil) and Delete (trash) with confirm. “Add product” primary button. Empty state when no products.
- **Add** (`/dashboard/products/new`): Form with photo (take/choose → upload to `products` folder), title, price (€), description, category dropdown, visibility (Draft / Public). Publish button. Cancel back to list.
- **Edit** (`/dashboard/products/[id]/edit`): Same form prefilled; Save updates. Back link to list.
- **Mobile:** 48px+ touch targets, full-width buttons, stacked layout, camera/gallery for photo.
