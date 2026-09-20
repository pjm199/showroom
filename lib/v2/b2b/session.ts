import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const B2B_SESSION_COOKIE = 'b2b_session'

export type B2BSessionPayload = {
  clientId: string
  shopId: string
  shopSlug: string
  email: string
  companyName: string
  exp: number
}

function getSecret(): string {
  return (
    process.env.B2B_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    'dev-b2b-session-secret-change-me'
  )
}

function encodePayload(payload: B2BSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(data).digest('base64url')
  return `${data}.${sig}`
}

function decodeToken(token: string): B2BSessionPayload | null {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null

  const expected = createHmac('sha256', getSecret()).update(data).digest('base64url')
  try {
    const sigBuf = Buffer.from(sig)
    const expectedBuf = Buffer.from(expected)
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null
    }
  } catch {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as B2BSessionPayload
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function createB2BSessionToken(
  payload: Omit<B2BSessionPayload, 'exp'>,
  maxAgeSeconds = 60 * 60 * 24 * 30
): string {
  return encodePayload({
    ...payload,
    exp: Date.now() + maxAgeSeconds * 1000,
  })
}

export function parseB2BSessionToken(token: string | undefined | null): B2BSessionPayload | null {
  if (!token) return null
  return decodeToken(token)
}

export async function getB2BSessionFromCookies(): Promise<B2BSessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(B2B_SESSION_COOKIE)?.value
  return parseB2BSessionToken(token)
}

export function getB2BSessionFromRequest(request: NextRequest): B2BSessionPayload | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return parseB2BSessionToken(authHeader.slice(7))
  }
  const token = request.cookies.get(B2B_SESSION_COOKIE)?.value
  return parseB2BSessionToken(token)
}

export function setB2BSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(B2B_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function clearB2BSessionCookie(response: NextResponse): void {
  response.cookies.set(B2B_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
