export interface B2BCatalogV2 {
  id: string
  shopId: string
  clientId: string | null
  name: string
  slug: string
  description: string | null
  notes: string | null
  coverAssetId: string | null
  audienceRuleId: string | null
  priceListRef: string | null
  requestOrderEnabled: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface B2BCatalogDetailV2 extends B2BCatalogV2 {
  items: B2BCatalogItemV2[]
}

export interface B2BCatalogItemV2 {
  id: string
  catalogId: string
  productId: string
  sortOrder: number
  notes: string | null
  customPriceCents: number | null
  createdAt: string
}

export interface B2BClientV2 {
  id: string
  shopId: string
  companyName: string
  contactName: string | null
  email: string
  customerGroupId: string | null
  assignedCatalogId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface B2BClientDetailV2 extends B2BClientV2 {
  customerGroup?: { id: string; name: string } | null
  assignedCatalog?: { id: string; name: string; slug: string } | null
  priceOverrides?: B2BClientPriceOverrideV2[]
  _count?: { priceOverrides: number; orders: number }
}

export interface B2BClientPriceOverrideV2 {
  id: string
  clientId: string
  productId: string
  priceCents: number
  createdAt: string
  updatedAt: string
  product?: { id: string; title: string; slug: string; priceCents: number | null }
}

export interface B2BAccessInviteV2 {
  id: string
  shopId: string
  catalogId: string | null
  clientId: string | null
  token: string
  label: string | null
  expiresAt: string
  maxUses: number | null
  useCount: number
  isActive: boolean
  createdAt: string
  catalog?: { id: string; name: string; slug: string } | null
}

export type B2BOrderStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED'

export interface B2BOrderItemV2 {
  productId: string
  title: string
  quantity: number
  priceCents: number | null
  notes?: string
}

export interface B2BOrderV2 {
  id: string
  shopId: string
  clientId: string | null
  inviteId: string | null
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  notes: string | null
  status: B2BOrderStatus
  items: B2BOrderItemV2[]
  createdAt: string
  updatedAt: string
  client?: { id: string; companyName: string; email: string } | null
}

export interface B2BCatalogProductV2 {
  id: string
  title: string
  slug: string
  shortDescription: string | null
  sku: string | null
  priceCents: number | null
  resolvedPriceCents: number | null
  notes: string | null
  coverUrl: string | null
  sortOrder: number
}

export interface B2BCatalogViewV2 {
  catalog: {
    id: string
    name: string
    slug: string
    description: string | null
    notes: string | null
    requestOrderEnabled: boolean
  }
  products: B2BCatalogProductV2[]
  client?: { companyName: string; contactName: string | null } | null
  isDemo: boolean
}

export interface CreateB2BCatalogInput {
  name: string
  slug?: string
  description?: string
  notes?: string
  coverAssetId?: string
  audienceRuleId?: string
  priceListRef?: string
  requestOrderEnabled?: boolean
  clientId?: string
}

export type UpdateB2BCatalogInput = Partial<CreateB2BCatalogInput>

export interface CreateB2BCatalogItemInput {
  productId: string
  sortOrder?: number
  notes?: string
  customPriceCents?: number
}

export type UpdateB2BCatalogItemInput = Omit<CreateB2BCatalogItemInput, 'productId'>

export interface CreateB2BClientInput {
  companyName: string
  contactName?: string
  email: string
  password?: string
  customerGroupId?: string
  assignedCatalogId?: string
}

export type UpdateB2BClientInput = Partial<
  Omit<CreateB2BClientInput, 'email'> & { isActive?: boolean; password?: string }
>

export interface CreateB2BPriceOverrideInput {
  productId: string
  priceCents: number
}

export interface CreateB2BAccessInviteInput {
  catalogId?: string
  clientId?: string
  label?: string
  expiresInHours?: number
  maxUses?: number
}

export interface CreateB2BOrderInput {
  customerName: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  items: { productId: string; quantity: number; notes?: string }[]
}
