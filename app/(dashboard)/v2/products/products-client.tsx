'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { ProductV2 } from '@/types/v2'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  ACTIVE: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  INACTIVE: { label: 'Inactive', className: 'bg-amber-100 text-amber-700' },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-400' },
  SEASONAL: { label: 'Seasonal', className: 'bg-purple-100 text-purple-700' },
}

const FILTERS = ['All', 'DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']

export function V2ProductsClient() {
  const [products, setProducts] = useState<ProductV2[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback(
    async (reset = false) => {
      setLoading(true)
      const params = new URLSearchParams({ limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter !== 'All') params.set('displayStatus', statusFilter)
      if (!reset && cursor) params.set('cursor', cursor)

      const res = await fetch(`/api/v2/products?${params}`)
      if (!res.ok) return setLoading(false)

      const json = await res.json()
      const items: ProductV2[] = json.data ?? []
      setProducts(reset ? items : (prev) => [...prev, ...items])
      setHasMore(json.meta?.pagination?.hasMore ?? false)
      setCursor(json.meta?.pagination?.nextCursor ?? null)
      setLoading(false)
    },
    [search, statusFilter, cursor]
  )

  useEffect(() => {
    setCursor(null)
    load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          placeholder="Search by title, SKU, tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 text-sm rounded-xl font-medium border transition-colors ${
                statusFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'All' ? 'All' : STATUS_LABELS[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      {loading && products.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-500 text-sm">No products yet.</p>
          <Link
            href="/v2/products/new"
            className="mt-3 inline-flex text-sm text-indigo-600 hover:underline"
          >
            Create your first product →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => {
            const status = STATUS_LABELS[p.displayStatus] ?? STATUS_LABELS.DRAFT
            const readinessColor =
              p.publicationReadiness >= 80
                ? 'bg-emerald-500'
                : p.publicationReadiness >= 50
                ? 'bg-amber-400'
                : 'bg-slate-300'

            return (
              <div
                key={p.id}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 hover:border-slate-300 transition-colors"
              >
                {/* Readiness dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${readinessColor}`}
                  title={`Readiness: ${p.publicationReadiness}%`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 text-sm truncate">
                      {p.title}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                    {p.badges.map((b) => (
                      <span
                        key={b}
                        className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {p.sku && (
                      <span className="text-xs text-slate-400 font-mono">{p.sku}</span>
                    )}
                    {p.priceCents != null && (
                      <span className="text-xs text-slate-500">
                        €{(p.priceCents / 100).toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Readiness {p.publicationReadiness}%
                    </span>
                  </div>
                </div>

                <Link
                  href={`/v2/products/${p.id}/edit`}
                  className="shrink-0 min-h-[36px] px-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 flex items-center transition-colors"
                >
                  Edit
                </Link>
              </div>
            )
          })}

          {hasMore && (
            <button
              onClick={() => load(false)}
              disabled={loading}
              className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
