'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { B2BCatalogViewV2 } from '@/types/v2'
import { b2bFetch, clearB2BToken } from '@/lib/api'
import { B2BCatalogView } from '@/components/b2b-catalog-view'

type Props = {
  mode: 'authenticated' | 'demo'
  demoToken?: string
}

export function B2BCatalogPageClient({ mode, demoToken }: Props) {
  const router = useRouter()
  const [data, setData] = useState<B2BCatalogViewV2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const path =
          mode === 'demo' && demoToken
            ? `/b2b/demo/${demoToken}`
            : '/b2b/catalog'

        const res = await b2bFetch(path)
        const json = await res.json()

        if (res.status === 401 && mode === 'authenticated') {
          clearB2BToken()
          router.replace('/b2b/login')
          return
        }

        if (!res.ok) {
          setError(json.error?.message ?? 'Catalogo non disponibile')
          return
        }

        setData(json.data)
      } catch {
        setError('Errore di connessione')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mode, demoToken, router])

  if (loading) {
    return <p className="text-center text-slate-400 py-16">Caricamento catalogo…</p>
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-red-600">{error}</p>
        {mode === 'demo' && (
          <a href="/b2b/login" className="text-indigo-600 text-sm hover:underline">
            Accedi come cliente registrato
          </a>
        )}
      </div>
    )
  }

  if (!data) return null

  return <B2BCatalogView data={data} demoToken={demoToken} />
}
