/**
 * Computes the publication readiness score (0–100) for a V2 product.
 * Penalizes missing fields that are required for a good storefront presentation.
 */
export function computeReadinessScore(product: {
  title: string
  shortDescription: string | null
  longDescription: string | null
  priceCents: number | null
  isPurchasable: boolean
  categoryId: string | null
  brandId: string | null
  mediaCount: number
}): number {
  let score = 0

  // Required fields (each worth fixed points)
  if (product.title?.trim()) score += 20
  if (product.shortDescription?.trim()) score += 15
  if (product.longDescription?.trim()) score += 15
  if (product.mediaCount >= 1) score += 20
  if (product.categoryId) score += 10
  if (product.brandId) score += 5

  // Price (only required if purchasable)
  if (product.isPurchasable) {
    if (product.priceCents && product.priceCents > 0) score += 15
  } else {
    score += 15 // non-purchasable products don't need a price
  }

  return Math.min(100, score)
}
