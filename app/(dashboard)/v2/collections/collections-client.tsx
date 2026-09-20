'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { CollectionV2 } from '@/types/v2'

const TYPE_LABELS: Record<string, { label: string; className: string }> = {
  SEASONAL: { label: 'Seasonal', className: 'bg-amber-100 text-amber-700' },
  PROMO: { label: 'Promo', className: 'bg-red-100 text-red-700' },
  EDITORIAL: { label: 'Editorial', className: 'bg-purple-100 text-purple-700' },
  LAUNCH: { label: 'Launch', className: 'bg-blue-100 text-blue-700' },
  OUTLET: { label: 'Outlet', className: 'bg-slate-100 text-slate-600' },
  B2B: { label: 'B2B', className: 'bg-indigo-100 text-indigo-700' },
}

export function V2CollectionsClient() {
  const [collections, setCollections] = useState<(CollectionV2 & { _count?: { items: number } })[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/v2/collections?limit=50')
    if (res.ok) {
      const json = await res.json()
      setCollections(json.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete collection "${name}"?`)) return
    await fetch(`/api/v2/collections/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
  }

  if (collections.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500 text-sm">No collections yet.</p>
        <Link
          href="/v2/collections/new"
          className="mt-3 inline-flex text-sm text-indigo-600 hover:underline"
        >
          Create your first collection →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {collections.map((col) => {
        const typeStyle = TYPE_LABELS[col.type] ?? TYPE_LABELS.EDITORIAL

        return (
          <div
            key={col.id}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-900 text-sm truncate">{col.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyle.className}`}>
                  {typeStyle.label}
                </span>
                {!col.isActive && (
                  <span className="text-xs text-slate-400">inactive</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">{col.slug}</span>
                {col._count?.items != null && (
                  <span className="text-xs text-slate-400">
                    {col._count.items} product{col._count.items !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/v2/collections/${col.id}/edit`}
                className="min-h-[36px] px-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 flex items-center transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(col.id, col.name)}
                className="min-h-[36px] px-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl flex items-center transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
