'use client'

import { useRouter } from 'next/navigation'
import { b2bFetch, clearB2BToken } from '@/lib/api'

export function B2BLogoutButton() {
  const router = useRouter()

  async function logout() {
    await b2bFetch('/b2b/logout', { method: 'POST' })
    clearB2BToken()
    router.push('/b2b/login')
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="text-sm text-slate-500 hover:text-slate-700"
    >
      Esci
    </button>
  )
}
