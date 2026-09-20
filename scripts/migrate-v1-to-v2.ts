/**
 * Vetrina V1 → V2 Data Migration Script
 *
 * Migrates a single V1 tenant (Shop) to V2, including:
 *   - Shop → V2Shop
 *   - Users → V2User (all get OWNER role; adjust manually after)
 *   - Categories → V2Category
 *   - Products → V2Product (with DRAFT displayStatus)
 *   - Creates a default STOREFRONT PublicationTarget
 *
 * Usage:
 *   npx ts-node scripts/migrate-v1-to-v2.ts --shopId=<V1_SHOP_ID>
 *   npx ts-node scripts/migrate-v1-to-v2.ts --shopId=<V1_SHOP_ID> --dryRun
 *
 * This script is ADDITIVE — it will not delete V1 data.
 * Run it once per tenant. If it fails, fix the error and re-run (it is idempotent for shops).
 */

import { PrismaClient as PrismaV1 } from '@prisma/client'
import { PrismaClient as PrismaV2 } from '../lib/prisma-v2-client'
import * as bcrypt from 'bcryptjs'

const v1 = new PrismaV1()
const v2 = new PrismaV2()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200)
}

async function migrateShop(shopId: string, dryRun: boolean) {
  console.log(`\n─── Migrating shop: ${shopId} (dryRun=${dryRun}) ───\n`)

  // ─── Load V1 data ──────────────────────────────────────────────────────────

  const shop = await v1.shop.findUnique({
    where: { id: shopId },
    include: {
      users: true,
    },
  })

  if (!shop) {
    throw new Error(`Shop ${shopId} not found in V1`)
  }

  console.log(`Shop: "${shop.name}" (slug: ${shop.slug})`)
  console.log(`Users: ${shop.users.length}`)

  const categories = await v1.category.findMany({ where: { shopId } })
  console.log(`Categories: ${categories.length}`)

  const products = await v1.product.findMany({ where: { shopId } })
  console.log(`Products: ${products.length}`)

  if (dryRun) {
    console.log('\n[DRY RUN] No changes written.\n')
    return
  }

  // ─── Migrate Shop ──────────────────────────────────────────────────────────

  const existingV2Shop = await v2.v2Shop.findUnique({
    where: { slug: shop.slug },
    select: { id: true },
  })

  let v2ShopId: string
  if (existingV2Shop) {
    console.log(`  Shop already exists in V2 (id: ${existingV2Shop.id}), skipping create.`)
    v2ShopId = existingV2Shop.id
  } else {
    const v2Shop = await v2.v2Shop.create({
      data: {
        id: shop.id, // preserve V1 id for easy cross-reference
        name: shop.name,
        slug: shop.slug,
        description: shop.description ?? null,
        imageUrl: shop.imageUrl ?? null,
        whatsapp: shop.whatsapp ?? null,
        address: shop.address ?? null,
        mapUrl: shop.mapUrl ?? null,
        operatingMode: 'BASE',
        orderingEnabled: shop.orderingEnabled,
        shareToken: shop.shareToken ?? null,
      },
    })
    v2ShopId = v2Shop.id
    console.log(`  ✓ V2Shop created: ${v2ShopId}`)
  }

  // ─── Migrate Users ─────────────────────────────────────────────────────────

  for (const user of shop.users) {
    const existing = await v2.v2User.findUnique({
      where: { email: user.email },
      select: { id: true },
    })

    if (existing) {
      console.log(`  User ${user.email} already in V2, skipping.`)
      continue
    }

    await v2.v2User.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name ?? null,
        shopId: v2ShopId,
        role: 'OWNER',
      },
    })
    console.log(`  ✓ User migrated: ${user.email}`)
  }

  // Use the first user as the system actor for created-by fields
  const systemUserId = shop.users[0]?.id
  if (!systemUserId) throw new Error('Shop has no users — cannot migrate')

  // ─── Create default publication target ────────────────────────────────────

  const existingTarget = await v2.v2PublicationTarget.findFirst({
    where: { shopId: v2ShopId, type: 'STOREFRONT' },
    select: { id: true },
  })

  if (!existingTarget) {
    await v2.v2PublicationTarget.create({
      data: {
        shopId: v2ShopId,
        type: 'STOREFRONT',
        name: 'Public Storefront',
        isActive: true,
      },
    })
    console.log('  ✓ Default STOREFRONT publication target created')
  }

  // ─── Migrate Categories ────────────────────────────────────────────────────

  const categoryIdMap = new Map<string, string>()

  for (const cat of categories) {
    const existing = await v2.v2Category.findFirst({
      where: { shopId: v2ShopId, slug: cat.slug },
      select: { id: true },
    })

    if (existing) {
      categoryIdMap.set(cat.id, existing.id)
      console.log(`  Category "${cat.name}" already in V2, skipping.`)
      continue
    }

    const v2Cat = await v2.v2Category.create({
      data: {
        id: cat.id,
        shopId: v2ShopId,
        name: cat.name,
        slug: cat.slug,
        sortOrder: 0,
      },
    })
    categoryIdMap.set(cat.id, v2Cat.id)
    console.log(`  ✓ Category migrated: "${cat.name}"`)
  }

  // ─── Migrate Products ──────────────────────────────────────────────────────

  let migratedCount = 0
  let skippedCount = 0

  for (const product of products) {
    const existingProduct = await v2.v2Product.findFirst({
      where: { shopId: v2ShopId, slug: product.slug },
      select: { id: true },
    })

    if (existingProduct) {
      skippedCount++
      continue
    }

    // Map V1 visibility to V2 displayStatus
    const displayStatus =
      product.visibility === 'VISIBLE'
        ? 'ACTIVE'
        : product.visibility === 'HIDDEN'
        ? 'INACTIVE'
        : 'DRAFT'

    const v2Product = await v2.v2Product.create({
      data: {
        id: product.id,
        shopId: v2ShopId,
        title: product.name,
        shortDescription: product.description ?? null,
        longDescription: null,
        slug: product.slug,
        sku: null,
        categoryId: product.categoryId ? (categoryIdMap.get(product.categoryId) ?? null) : null,
        tags: [],
        badges: [],
        highlights: [],
        priceCents: product.priceCents ?? null,
        isPurchasable: true,
        displayStatus: displayStatus as any,
        publicationReadiness: product.name && product.imageUrl ? 35 : 20,
      },
    })

    // Migrate the single imageUrl as a MediaAsset + ProductMedia
    if (product.imageUrl) {
      const asset = await v2.v2MediaAsset.create({
        data: {
          shopId: v2ShopId,
          url: product.imageUrl,
          mimeType: 'image/jpeg',
          sizeBytes: 0,
          uploadedBy: systemUserId,
        },
      })

      await v2.v2ProductMedia.create({
        data: {
          productId: v2Product.id,
          assetId: asset.id,
          role: 'COVER',
          sortOrder: 0,
        },
      })
    }

    migratedCount++
  }

  console.log(`  ✓ Products migrated: ${migratedCount} (skipped: ${skippedCount})`)

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n✅ Migration complete for shop "${shop.name}"`)
  console.log(`   V2 Shop ID: ${v2ShopId}`)
  console.log(`   Next steps:`)
  console.log(`   1. Review migrated products in the V2 dashboard (/v2/products)`)
  console.log(`   2. Add cover images where missing`)
  console.log(`   3. Adjust user roles as needed`)
  console.log(`   4. Set up publication intents when ready to go live`)
}

async function main() {
  const args = process.argv.slice(2)
  const shopIdArg = args.find((a) => a.startsWith('--shopId='))
  const dryRun = args.includes('--dryRun')

  if (!shopIdArg) {
    console.error('Usage: ts-node scripts/migrate-v1-to-v2.ts --shopId=<id> [--dryRun]')
    process.exit(1)
  }

  const shopId = shopIdArg.replace('--shopId=', '')

  try {
    await migrateShop(shopId, dryRun)
  } catch (err) {
    console.error('\n❌ Migration failed:', err)
    process.exit(1)
  } finally {
    await v1.$disconnect()
    await v2.$disconnect()
  }
}

main()
