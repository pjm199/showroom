import type { V2UserRole } from '@/types/v2'
import { NextResponse } from 'next/server'

type Permission =
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'products:publish'
  | 'media:read'
  | 'media:write'
  | 'media:delete'
  | 'publication:read'
  | 'publication:write'
  | 'collections:read'
  | 'collections:write'
  | 'collections:delete'
  | 'b2b:read'
  | 'b2b:write'
  | 'b2b:delete'
  | 'composer:read'
  | 'composer:write'
  | 'composer:publish'
  | 'shop:admin'

const ROLE_PERMISSIONS: Record<V2UserRole, Permission[]> = {
  OWNER: [
    'products:read', 'products:write', 'products:delete', 'products:publish',
    'media:read', 'media:write', 'media:delete',
    'publication:read', 'publication:write',
    'collections:read', 'collections:write', 'collections:delete',
    'b2b:read', 'b2b:write', 'b2b:delete',
    'composer:read', 'composer:write', 'composer:publish',
    'shop:admin',
  ],
  ADMIN: [
    'products:read', 'products:write', 'products:delete', 'products:publish',
    'media:read', 'media:write', 'media:delete',
    'publication:read', 'publication:write',
    'collections:read', 'collections:write', 'collections:delete',
    'b2b:read', 'b2b:write', 'b2b:delete',
    'composer:read', 'composer:write', 'composer:publish',
    'shop:admin',
  ],
  EDITOR: [
    'products:read', 'products:write',
    'media:read', 'media:write',
    'publication:read',
    'collections:read', 'collections:write',
    'b2b:read',
    'composer:read', 'composer:write',
  ],
  SALES_OPERATOR: [
    'products:read',
    'media:read',
    'publication:read', 'publication:write',
    'collections:read', 'collections:write',
    'b2b:read',
    'composer:read',
  ],
  B2B_MANAGER: [
    'products:read',
    'media:read',
    'publication:read',
    'collections:read',
    'b2b:read', 'b2b:write',
    'composer:read',
  ],
  APPROVER: [
    'products:read',
    'media:read',
    'publication:read', 'publication:write',
    'collections:read',
    'b2b:read',
    'composer:read',
  ],
}

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role as V2UserRole]
  return permissions?.includes(permission) ?? false
}

export function requirePermission(
  role: string,
  permission: Permission
): NextResponse | null {
  if (!hasPermission(role, permission)) {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: `Role '${role}' does not have permission: ${permission}`,
        },
      },
      { status: 403 }
    )
  }
  return null
}
