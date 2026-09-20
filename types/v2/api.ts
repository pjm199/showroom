// Shared API response envelope types

export interface ApiSuccess<T> {
  data: T
  meta?: ApiMeta
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface ApiMeta {
  pagination?: {
    nextCursor: string | null
    hasMore: boolean
    total?: number
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// Type guard
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiError).error === 'object'
  )
}

// Known API error codes
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'ALREADY_PUBLISHED'
  | 'INTENT_NOT_FOUND'
  | 'MEDIA_IN_USE'
  | 'VERSION_NOT_DRAFT'
  | 'PUBLISHED_VERSION_EXISTS'
  | 'INTERNAL_ERROR'
