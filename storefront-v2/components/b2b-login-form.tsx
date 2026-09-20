'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { b2bFetch, setB2BToken } from '@/lib/api'

export function B2BLoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)

    try {
      const res = await b2bFetch('/b2b/login', {
        method: 'POST',
        body: JSON.stringify({
          email: fd.get('email'),
          password: fd.get('password'),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'Credenziali non valide')
        return
      }
      if (json.data?.token) setB2BToken(json.data.token)
      router.push('/b2b/catalog')
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full min-h-[48px] rounded-xl border border-slate-200 px-4 text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full min-h-[48px] rounded-xl border border-slate-200 px-4 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[48px] bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? 'Accesso…' : 'Accedi al catalogo B2B'}
      </button>
    </form>
  )
}
