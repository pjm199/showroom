/**
 * V2 feature flag — controls which tenants have access to the V2 dashboard.
 *
 * In development: always enabled if V2_ENABLED=true
 * In production: enabled per-shop via V2_ENABLED_SHOPS=shopId1,shopId2,...
 *
 * To enable for all shops: set V2_ENABLED_SHOPS=*
 */

export function isV2EnabledForShop(shopId: string): boolean {
  const flag = process.env.V2_ENABLED

  if (flag === 'true' || flag === '1') return true
  if (!flag) return false

  const allowedShops = (process.env.V2_ENABLED_SHOPS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (allowedShops.includes('*')) return true
  return allowedShops.includes(shopId)
}
