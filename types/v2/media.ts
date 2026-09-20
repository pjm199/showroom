export interface MediaAssetV2 {
  id: string
  shopId: string
  url: string
  mimeType: string
  width: number | null
  height: number | null
  sizeBytes: number
  altText: string | null
  focalPointX: number | null
  focalPointY: number | null
  tags: string[]
  uploadedBy: string
  createdAt: string
}

export interface MediaViewModel {
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalPoint: { x: number; y: number } | null
}

export interface UpdateMediaAssetInput {
  altText?: string
  focalPointX?: number
  focalPointY?: number
  tags?: string[]
}
