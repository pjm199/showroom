# Vetrina V2 — Migration Runbook

This is the operational guide for migrating V1 tenants to V2 and sunsetting V1.

---

## Prerequisites

- `DATABASE_URL_V2` must point to a running PostgreSQL instance (same or separate from V1)
- V2 schema must be applied: `npm run v2:db:push` or `npm run v2:migrate:deploy`
- V2 client must be generated: `npm run v2:generate`
- Section types must be seeded: `npm run v2:seed:sections`

---

## Step 1 — Opt-in a Tenant

Enable V2 access for a specific shop ID in your environment:

```bash
# .env.local (dev) or production environment
V2_ENABLED_SHOPS=clxxxxxxxxxx
```

Or for all shops in development:
```bash
V2_ENABLED=true
```

The V2 dashboard becomes accessible at `/v2` for users of that shop.

---

## Step 2 — Migrate a Single Tenant

```bash
# Dry run first — no writes
npm run v2:migrate:tenant -- --shopId=clxxxxxxxxxx --dryRun

# Actual migration
npm run v2:migrate:tenant -- --shopId=clxxxxxxxxxx
```

The script migrates:
- `Shop` → `V2Shop` (preserves ID)
- `User[]` → `V2User[]` (all with OWNER role — adjust via V2 dashboard)
- `Category[]` → `V2Category[]`
- `Product[]` → `V2Product[]` (DRAFT status, priceCents preserved)
- Creates one default `STOREFRONT` `PublicationTarget`
- Migrates single `imageUrl` per product into `V2MediaAsset` + `V2ProductMedia`

---

## Step 3 — Verify Migration

```bash
npm run v2:verify:migration -- --shopId=clxxxxxxxxxx
```

Review the output for any `⚠️` warnings. Common issues:
- Products without cover media — add images in the V2 Media Library
- User count mismatch — check for duplicate emails

---

## Step 4 — Tenant Enrichment in V2

The merchant should now:
1. Log in and access the V2 dashboard at `/v2`
2. Review all migrated products, add missing descriptions and images
3. Set product `displayStatus` to `ACTIVE` when ready
4. Create publication intents for products they want live on the storefront
5. Build the homepage in the Site Composer
6. Preview and publish the homepage

---

## Step 5 — Point Storefront Traffic to V2

1. Deploy `storefront-v2` with the correct `VETRINA_API_URL` and `SHOP_SLUG`.
2. Set up DNS / proxy to route the shop's domain to `storefront-v2`.
3. Configure URL redirects: `/s/<slug>` (V1 storefront) → `storefront-v2` routes.
4. Monitor traffic — keep V1 live as fallback for 30 days.

### Redirect rules (example for Vercel / nginx)

```
# Vercel rewrites.json
{ "source": "/s/:slug", "destination": "https://storefront-v2.vercel.app/:path*" }
```

---

## Step 6 — V1 Sunset

Only after **all tenants confirmed migrated** and **zero V1 traffic for 30 days**:

1. Set `V1_DEPRECATED=true` in the main app environment.
2. Remove or archive `app/(storefront)/s/[slug]/` and `app/(dashboard)/dashboard/` routes.
3. Remove V1 API routes: `app/api/shops/`.
4. Drop V1 tables (optional, after backup): `prisma migrate dev --name drop-v1-tables`.

**Never drop V1 tables while any tenant may still depend on them.**

---

## Rollback

If a tenant has issues in V2:
1. Remove their shop ID from `V2_ENABLED_SHOPS`.
2. They automatically fall back to the V1 dashboard.
3. V1 data is never modified by V2 operations — no risk of corruption.

---

## Data Mapping Reference

| V1 field | V2 equivalent | Notes |
|---|---|---|
| `Product.name` | `V2Product.title` | |
| `Product.description` | `V2Product.shortDescription` | |
| `Product.imageUrl` | `V2MediaAsset.url` + `V2ProductMedia` | role=COVER |
| `Product.priceCents` | `V2Product.priceCents` | direct |
| `Product.visibility=VISIBLE` | `V2Product.displayStatus=ACTIVE` | |
| `Product.visibility=HIDDEN` | `V2Product.displayStatus=INACTIVE` | |
| `Product.slug` | `V2Product.slug` | preserved |
| `Category.name` | `V2Category.name` | |
| `Category.slug` | `V2Category.slug` | |
| `Shop.orderingEnabled` | `V2Shop.orderingEnabled` | |
| `Shop.shareToken` | `V2Shop.shareToken` | |
| `Order` / `OrderItem` | Not migrated | Orders remain in V1 for history |
| `ProductShareToken` | Not migrated | Replace with V2 AudienceRule (PRIVATE_LINK) |

---

## What Is NOT Migrated

- **Orders and order history**: Remain in V1. Build a read-only order history view in V2 if needed.
- **ProductShareToken**: Replace with `AudienceRule` of type `PRIVATE_LINK` in V2.
- **CustomerGroup**: Migrate manually to `V2CustomerGroup` if using audience segmentation.
