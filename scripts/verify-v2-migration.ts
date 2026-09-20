/**
 * Verification script — run after migrate-v1-to-v2.ts to confirm data integrity.
 *
 * Usage:
 *   npx ts-node scripts/verify-v2-migration.ts --shopId=<V1_SHOP_ID>
 */

import { PrismaClient as PrismaV1 } from '@prisma/client'
import { PrismaClient as PrismaV2 } from '../lib/prisma-v2-client'

const v1 = new PrismaV1()
const v2 = new PrismaV2()

async function verify(shopId: string) {
  console.log(`\n─── Verifying migration for shop: ${shopId} ───\n`)

  const v1Shop = await v1.shop.findUnique({ where: { id: shopId } })
  if (!v1Shop) throw new Error(`Shop ${shopId} not found in V1`)

  const v2Shop = await v2.v2Shop.findUnique({ where: { slug: v1Shop.slug } })
  if (!v2Shop) {
    console.error('❌ V2 Shop NOT found')
    return
  }
  console.log(`✓ Shop: "${v2Shop.name}" (${v2Shop.id})`)

  const [v1Users, v2Users] = await Promise.all([
    v1.user.count({ where: { shopId } }),
    v2.v2User.count({ where: { shopId: v2Shop.id } }),
  ])
  const userStatus = v1Users === v2Users ? '✓' : '⚠️'
  console.log(`${userStatus} Users: V1=${v1Users}, V2=${v2Users}`)

  const [v1Cats, v2Cats] = await Promise.all([
    v1.category.count({ where: { shopId } }),
    v2.v2Category.count({ where: { shopId: v2Shop.id } }),
  ])
  const catStatus = v1Cats === v2Cats ? '✓' : '⚠️'
  console.log(`${catStatus} Categories: V1=${v1Cats}, V2=${v2Cats}`)

  const [v1Products, v2Products] = await Promise.all([
    v1.product.count({ where: { shopId } }),
    v2.v2Product.count({ where: { shopId: v2Shop.id } }),
  ])
  const productStatus = v1Products === v2Products ? '✓' : '⚠️'
  console.log(`${productStatus} Products: V1=${v1Products}, V2=${v2Products}`)

  // Check for products without cover media
  const productsWithoutMedia = await v2.v2Product.count({
    where: {
      shopId: v2Shop.id,
      media: { none: {} },
    },
  })
  if (productsWithoutMedia > 0) {
    console.log(`⚠️  ${productsWithoutMedia} products have no media — add cover images in V2 dashboard`)
  }

  const publicationTargets = await v2.v2PublicationTarget.count({
    where: { shopId: v2Shop.id },
  })
  console.log(`✓ Publication targets: ${publicationTargets}`)

  console.log('\nVerification complete.')
}

async function main() {
  const args = process.argv.slice(2)
  const shopIdArg = args.find((a) => a.startsWith('--shopId='))
  if (!shopIdArg) {
    console.error('Usage: ts-node scripts/verify-v2-migration.ts --shopId=<id>')
    process.exit(1)
  }

  const shopId = shopIdArg.replace('--shopId=', '')
  try {
    await verify(shopId)
  } catch (err) {
    console.error('❌ Verification failed:', err)
    process.exit(1)
  } finally {
    await v1.$disconnect()
    await v2.$disconnect()
  }
}

main()
