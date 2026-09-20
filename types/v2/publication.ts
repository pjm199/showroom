export type PublicationTargetType =
  | 'STOREFRONT'
  | 'B2B_CATALOG'
  | 'ECOMMERCE_CHANNEL'
  | 'WIDGET'
  | 'SECTION'

export interface PublicationTargetV2 {
  id: string
  shopId: string
  type: PublicationTargetType
  name: string
  channelRef: string | null
  isActive: boolean
  createdAt: string
}

export type PublicationEntityType = 'PRODUCT' | 'COLLECTION' | 'PAGE'

export type PublicationStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'FAILED'

export type PublicationSyncStatus =
  | 'PENDING'
  | 'SYNCED'
  | 'FAILED'
  | 'NOT_APPLICABLE'

export interface PublicationIntentV2 {
  id: string
  shopId: string
  entityType: PublicationEntityType
  entityId: string
  targetId: string
  status: PublicationStatus
  scheduledAt: string | null
  expiresAt: string | null
  publishedAt: string | null
  unpublishedAt: string | null
  audienceRuleId: string | null
  syncStatus: PublicationSyncStatus
  syncError: string | null
  updatedAt: string
  createdAt: string
}

export type AudienceRuleType = 'PUBLIC' | 'B2B_ONLY' | 'SEGMENT' | 'PRIVATE_LINK'

export interface AudienceRuleV2 {
  id: string
  shopId: string
  name: string
  type: AudienceRuleType
  segmentIds: string[]
  accessToken: string | null
  createdAt: string
}

export interface CreatePublicationIntentInput {
  entityType: PublicationEntityType
  entityId: string
  targetId: string
  status?: PublicationStatus
  scheduledAt?: string
  expiresAt?: string
  audienceRuleId?: string
}

export interface UpdatePublicationIntentInput {
  status?: PublicationStatus
  scheduledAt?: string
  expiresAt?: string
  audienceRuleId?: string
}
