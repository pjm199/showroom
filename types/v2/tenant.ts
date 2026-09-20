export type OperatingMode = 'BASE' | 'FULL'

export type UserRole =
  | 'OWNER'
  | 'ADMIN'
  | 'EDITOR'
  | 'SALES_OPERATOR'
  | 'B2B_MANAGER'
  | 'APPROVER'

export interface ShopV2 {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  whatsapp: string | null
  address: string | null
  mapUrl: string | null
  operatingMode: OperatingMode
  orderingEnabled: boolean
  shareToken: string | null
  shareTokenExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UserV2 {
  id: string
  email: string
  name: string | null
  shopId: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface ShopSummary {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  whatsapp: string | null
  address: string | null
  mapUrl: string | null
}
