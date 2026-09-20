'use client'

import { useState } from 'react'
import type { B2BCatalogViewV2 } from '@/types/v2'
import { b2bFetch } from '@/lib/api'

export function formatPrice(cents: number | null | undefined) {
  if (cents == null) return 'Su richiesta'
  return `€${(cents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
}

export function B2BCatalogView({
  data,
  demoToken,
}: {
  data: B2BCatalogViewV2
  demoToken?: string
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        {data.isDemo && (
          <span className="inline-block text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
            Accesso demo
          </span>
        )}
        {data.client && !data.isDemo && (
          <p className="text-sm text-slate-500">Benvenuto, {data.client.companyName}</p>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{data.catalog.name}</h1>
        {data.catalog.description && <p className="text-slate-600">{data.catalog.description}</p>}
        {data.catalog.notes && <p className="text-sm text-slate-500 italic">{data.catalog.notes}</p>}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.products.map((product) => (
          <article key={product.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {product.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.coverUrl} alt={product.title} className="w-full aspect-square object-cover bg-slate-100" />
            ) : (
              <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-300 text-sm">
                No image
              </div>
            )}
            <div className="p-4 space-y-2">
              <h2 className="font-semibold text-slate-900">{product.title}</h2>
              {product.shortDescription && (
                <p className="text-sm text-slate-500 line-clamp-2">{product.shortDescription}</p>
              )}
              {product.sku && <p className="text-xs text-slate-400 font-mono">{product.sku}</p>}
              <p className="text-lg font-bold text-indigo-700">{formatPrice(product.resolvedPriceCents)}</p>
              {product.notes && <p className="text-xs text-slate-500">{product.notes}</p>}
            </div>
          </article>
        ))}
      </div>

      {data.products.length === 0 && (
        <p className="text-center text-slate-400 py-12">Nessun prodotto in questo catalogo.</p>
      )}

      {data.catalog.requestOrderEnabled && (
        <B2BOrderForm demoToken={demoToken} products={data.products} isDemo={data.isDemo} />
      )}
    </div>
  )
}

function B2BOrderForm({
  demoToken,
  products,
  isDemo,
}: {
  demoToken?: string
  products: B2BCatalogViewV2['products']
  isDemo: boolean
}) {
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function toggleProduct(id: string) {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = 1
      return next
    })
  }

  function setQty(id: string, qty: number) {
    if (qty < 1) return
    setSelected((prev) => ({ ...prev, [id]: qty }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const items = Object.entries(selected).map(([productId, quantity]) => ({ productId, quantity }))
    if (items.length === 0) {
      setMessage('Seleziona almeno un prodotto')
      setStatus('error')
      return
    }

    setStatus('loading')
    const fd = new FormData(e.currentTarget)

    try {
      const res = await b2bFetch('/b2b/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          customerPhone: fd.get('customerPhone') || undefined,
          customerEmail: fd.get('customerEmail') || undefined,
          notes: fd.get('notes') || undefined,
          items,
          demoToken: demoToken || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json.error?.message ?? 'Invio fallito')
        setStatus('error')
        return
      }
      setStatus('success')
      setMessage('Richiesta inviata con successo!')
      setSelected({})
    } catch {
      setMessage('Errore di connessione')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-6 text-center">
        <p className="text-emerald-800 font-medium">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50">
      <h2 className="font-semibold text-slate-900">Richiesta ordine</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="customerName" required placeholder="Nome / Azienda" className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm bg-white" />
        <input name="customerPhone" placeholder="Telefono" className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm bg-white" />
        <input name="customerEmail" type="email" placeholder="Email" className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm bg-white sm:col-span-2" />
      </div>
      <textarea name="notes" placeholder="Note ordine" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" />
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Prodotti</p>
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 text-sm bg-white p-2 rounded-xl border border-slate-100">
            <input type="checkbox" checked={!!selected[p.id]} onChange={() => toggleProduct(p.id)} className="rounded" />
            <span className="flex-1">{p.title}</span>
            {selected[p.id] != null && (
              <input
                type="number"
                min={1}
                value={selected[p.id]}
                onChange={(e) => setQty(p.id, Number(e.target.value))}
                className="w-16 min-h-[36px] rounded-lg border border-slate-200 px-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
      {message && status === 'error' && <p className="text-sm text-red-600">{message}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full min-h-[48px] bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:opacity-60"
      >
        {status === 'loading' ? 'Invio…' : 'Invia richiesta'}
      </button>
      {isDemo && (
        <p className="text-xs text-slate-500 text-center">Accesso demo — prezzi negoziati non inclusi.</p>
      )}
    </form>
  )
}
