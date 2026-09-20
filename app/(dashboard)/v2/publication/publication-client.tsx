'use client'

import { useEffect, useState } from 'react'
import type { PublicationIntentV2, PublicationTargetV2 } from '@/types/v2'

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  UNPUBLISHED: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
}

export function V2PublicationClient() {
  const [intents, setIntents] = useState<
    (PublicationIntentV2 & { target?: PublicationTargetV2 })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/v2/publication/intents')
    if (res.ok) {
      const json = await res.json()
      setIntents(json.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublish(intent: PublicationIntentV2) {
    setActioning(intent.id)
    const action = intent.status === 'PUBLISHED' ? 'unpublish' : 'publish'
    await fetch(`/api/v2/publication/intents/${intent.id}/${action}`, {
      method: 'POST',
    })
    await load()
    setActioning(null)
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
  }

  if (intents.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        No publication intents yet. Publish a product to see it here.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {intents.map((intent) => {
        const statusStyle = STATUS_STYLES[intent.status] ?? STATUS_STYLES.DRAFT
        const isPublished = intent.status === 'PUBLISHED'

        return (
          <div
            key={intent.id}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400">
                  {intent.entityType}
                </span>
                <span className="text-sm font-medium text-slate-900 truncate">
                  {intent.entityId.slice(0, 12)}…
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle}`}>
                  {intent.status}
                </span>
                {intent.target && (
                  <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                    {intent.target.name}
                  </span>
                )}
              </div>
              {intent.scheduledAt && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Scheduled: {new Date(intent.scheduledAt).toLocaleString()}
                </p>
              )}
            </div>

            <button
              onClick={() => togglePublish(intent)}
              disabled={actioning === intent.id}
              className={`shrink-0 min-h-[36px] px-3 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${
                isPublished
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {actioning === intent.id
                ? '…'
                : isPublished
                ? 'Unpublish'
                : 'Publish'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
