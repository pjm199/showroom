import { NextRequest, NextResponse } from 'next/server'
import { getB2BSessionFromRequest, clearB2BSessionCookie } from '@/lib/v2/b2b/session'

export async function POST(request: NextRequest) {
  const session = getB2BSessionFromRequest(request)
  const response = NextResponse.json({
    data: { loggedOut: true, hadSession: !!session },
  })
  clearB2BSessionCookie(response)
  return response
}
