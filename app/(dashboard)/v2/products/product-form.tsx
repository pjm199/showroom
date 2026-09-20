'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductV2 } from '@/types/v2'

type Props = {
  product?: ProductV2
}

const DISPLAY_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const

const ALL_BADGES = ['NEW', 'FEATURED', 'PROMO', 'LIMITED', 'BESTSELLER', 'SEASONAL'] as const

export function V2ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    title: product?.title ?? '',
    shortDescription: product?.shortDescription ?? '',
    longDescription: product?.longDescription ?? '',
    sku: product?.sku ?? '',
    priceCents: product?.priceCents != null ? String(product.priceCents / 100) : '',
    isPurchasable: product?.isPurchasable ?? true,
    displayStatus: product?.displayStatus ?? 'DRAFT',
    tags: product?.tags.join(', ') ?? '',
    badges: product?.badges ?? [] as string[],
    highlights: product?.highlights ?? ['', '', '', '', ''],
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleBadge(badge: string) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(badge)
        ? f.badges.filter((b) => b !== badge)
        : [...f.badges, badge],
    }))
  }

  function setHighlight(index: number, value: string) {
    setForm((f) => {
      const highlights = [...f.highlights]
      highlights[index] = value
      return { ...f, highlights }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim() || null,
      longDescription: form.longDescription.trim() || null,
      sku: form.sku.trim() || null,
      priceCents: form.priceCents ? Math.round(parseFloat(form.priceCents) * 100) : null,
      isPurchasable: form.isPurchasable,
      displayStatus: form.displayStatus,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      badges: form.badges,
      highlights: form.highlights.filter(Boolean),
    }

    const url = isEdit ? `/api/v2/products/${product!.id}` : '/api/v2/products'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error?.message ?? 'Something went wrong')
      return
    }

    router.push('/v2/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Product name"
        />
      </div>

      {/* Short description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Short description
        </label>
        <input
          type="text"
          value={form.shortDescription}
          onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Headline copy, 1–2 sentences"
          maxLength={500}
        />
      </div>

      {/* Long description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Full description
        </label>
        <textarea
          value={form.longDescription}
          onChange={(e) => setForm((f) => ({ ...f, longDescription: e.target.value }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={5}
          placeholder="Detailed product description"
        />
      </div>

      {/* SKU + Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="REF-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Price (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.priceCents}
            onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Purchasable toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPurchasable"
          checked={form.isPurchasable}
          onChange={(e) => setForm((f) => ({ ...f, isPurchasable: e.target.checked }))}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600"
        />
        <label htmlFor="isPurchasable" className="text-sm text-slate-700">
          Product is purchasable (has a direct buy/order action)
        </label>
      </div>

      {/* Highlights */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selling highlights (up to 5)
        </label>
        <div className="space-y-2">
          {form.highlights.slice(0, 5).map((h, i) => (
            <input
              key={i}
              type="text"
              value={h}
              onChange={(e) => setHighlight(i, e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Highlight ${i + 1}`}
              maxLength={200}
            />
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tags{' '}
          <span className="text-slate-400 font-normal">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="outdoor, summer, promo"
        />
      </div>

      {/* Badges */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Badges</label>
        <div className="flex flex-wrap gap-2">
          {ALL_BADGES.map((badge) => (
            <button
              key={badge}
              type="button"
              onClick={() => toggleBadge(badge)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                form.badges.includes(badge)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Display status
        </label>
        <select
          value={form.displayStatus}
          onChange={(e) => setForm((f) => ({ ...f, displayStatus: e.target.value }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {DISPLAY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 min-h-[44px] bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
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
