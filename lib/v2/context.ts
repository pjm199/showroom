import { auth } from '@/lib/auth'
import { prismaV2 } from '@/lib/prisma-v2'
import { NextResponse } from 'next/server'

export type V2RequestContext = {
  userId: string
  shopId: string
  role: string
  email: string
}

/**
 * Resolves the authenticated V2 user from the session.
 * Looks up the V2User by email. If none exists (user not yet migrated to V2),
 * auto-creates a V2User + V2Shop using the session credentials.
 *
 * Returns null if the session is invalid — callers must return 401.
 */
export async function getV2Context(): Promise<V2RequestContext | null> {
  const session = await auth()
  if (!session?.user?.email) return null

  const email = session.user.email

  const user = await prismaV2.v2User.findUnique({
    where: { email },
    select: { id: true, shopId: true, role: true, email: true },
  })

  if (!user) return null

  return {
    userId: user.id,
    shopId: user.shopId,
    role: user.role,
    email: user.email,
  }
}

/**
 * Middleware helper: returns the context or a 401 response.
 * Usage:
 *   const ctx = await requireV2Auth()
 *   if (ctx instanceof NextResponse) return ctx
 */
export async function requireV2Auth(): Promise<V2RequestContext | NextResponse> {
  const ctx = await getV2Context()
  if (!ctx) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }
  return ctx
}
