'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { PageV2 } from '@/types/v2'

const PAGE_TYPE_LABELS: Record<string, string> = {
  HOMEPAGE: 'Homepage',
  CATEGORY: 'Category',
  COLLECTION: 'Collection',
  LANDING: 'Landing',
  BRAND: 'Brand',
}

type PageWithStatus = PageV2 & {
  versions?: Array<{ id: string; status: string; publishedAt: string | null }>
  _count?: { versions: number }
}

export function V2ComposerClient() {
  const [pages, setPages] = useState<PageWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/v2/composer/pages')
    if (res.ok) {
      const json = await res.json()
      setPages(json.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
  }

  if (pages.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500 text-sm">No pages yet. Start with your homepage.</p>
        <Link
          href="/v2/composer/new"
          className="mt-3 inline-flex text-sm text-indigo-600 hover:underline"
        >
          Create homepage →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {pages.map((page) => {
        const isPublished = (page.versions?.length ?? 0) > 0
        const versionCount = page._count?.versions ?? 0

        return (
          <div
            key={page.id}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-900 text-sm truncate">{page.title}</span>
                <span className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                  {PAGE_TYPE_LABELS[page.type] ?? page.type}
                </span>
                {isPublished ? (
                  <span className="text-xs text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 font-medium">
                    Live
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                    Draft
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">/{page.slug}</span>
                <span className="text-xs text-slate-400">{versionCount} version{versionCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <Link
              href={`/v2/composer/${page.id}`}
              className="shrink-0 min-h-[36px] px-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 flex items-center transition-colors"
            >
              Edit
            </Link>
          </div>
        )
      })}
    </div>
  )
}
