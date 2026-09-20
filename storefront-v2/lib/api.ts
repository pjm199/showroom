const API_BASE = process.env.VETRINA_API_URL ?? 'http://localhost:3000'
const SHOP_SLUG = process.env.SHOP_SLUG ?? ''

export function apiUrl(path: string) {
  return `${API_BASE}${path}`
}

export function shopApiUrl(path: string) {
  return apiUrl(`/api/v2/frontend/${SHOP_SLUG}${path}`)
}

export function getShopSlug() {
  return SHOP_SLUG
}

const B2B_TOKEN_KEY = 'b2b_session_token'

export function getB2BToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(B2B_TOKEN_KEY)
}

export function setB2BToken(token: string) {
  localStorage.setItem(B2B_TOKEN_KEY, token)
}

export function clearB2BToken() {
  localStorage.removeItem(B2B_TOKEN_KEY)
}

export async function b2bFetch(path: string, init?: RequestInit) {
  const token = typeof window !== 'undefined' ? getB2BToken() : null
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(shopApiUrl(path), { ...init, headers, credentials: 'include' })
}
