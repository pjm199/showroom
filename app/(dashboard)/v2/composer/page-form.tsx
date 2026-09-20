'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PAGE_TYPES = [
  { value: 'HOMEPAGE', label: 'Homepage' },
  { value: 'LANDING', label: 'Landing page' },
  { value: 'COLLECTION', label: 'Collection page' },
  { value: 'CATEGORY', label: 'Category page' },
  { value: 'BRAND', label: 'Brand page' },
] as const

export function V2PageForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    type: 'LANDING',
    slug: '',
    title: '',
    seoTitle: '',
    seoDescription: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const res = await fetch('/api/v2/composer/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type,
        slug: form.type === 'HOMEPAGE' ? 'home' : form.slug.trim(),
        title: form.title.trim(),
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error?.message ?? 'Something went wrong')
      return
    }

    const { data: page } = await res.json()
    router.push(`/v2/composer/${page.id}`)
  }

  const isHomepage = form.type === 'HOMEPAGE'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Page type</label>
        <div className="flex flex-wrap gap-2">
          {PAGE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t.value }))}
              className={`px-3 py-1.5 text-sm rounded-xl border font-medium transition-colors ${
                form.type === t.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Internal title <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Summer 2026 Landing"
        />
      </div>

      {!isHomepage && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            URL slug <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
              }))
            }
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="summer-2026"
          />
          <p className="text-xs text-slate-400 mt-1">
            Page will be available at /{form.slug || 'your-slug'}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 min-h-[44px] bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Creating…' : 'Create page'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-[44px] px-4 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
