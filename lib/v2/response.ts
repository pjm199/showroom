import { NextResponse } from 'next/server'
import type { ApiErrorCode } from '@/types/v2'

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status })
}

export function created<T>(data: T) {
  return ok(data, undefined, 201)
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status }
  )
}

export const errors = {
  unauthorized: () =>
    apiError('UNAUTHORIZED', 'Authentication required', 401),
  forbidden: (msg = 'Insufficient permissions') =>
    apiError('FORBIDDEN', msg, 403),
  notFound: (entity = 'Resource') =>
    apiError('NOT_FOUND', `${entity} not found`, 404),
  conflict: (msg: string) =>
    apiError('CONFLICT', msg, 409),
  validation: (msg: string, details?: unknown) =>
    apiError('VALIDATION_ERROR', msg, 400, details),
  internal: (msg = 'Internal server error') =>
    apiError('INTERNAL_ERROR', msg, 500),
  mediaInUse: () =>
    apiError('MEDIA_IN_USE', 'Cannot delete a media asset that is currently in use', 409),
  versionNotDraft: () =>
    apiError('VERSION_NOT_DRAFT', 'This operation requires a DRAFT page version', 409),
  alreadyPublished: () =>
    apiError('ALREADY_PUBLISHED', 'This entity is already published', 409),
}
