'use client'

import { useEffect, useState } from 'react'
import type { BrandV2 } from '@/types/v2'

export function V2BrandsClient() {
  const [brands, setBrands] = useState<BrandV2[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/v2/brands')
    if (res.ok) {
      const json = await res.json()
      setBrands(json.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    await fetch('/api/v2/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setNewName('')
    setCreating(false)
    setSaving(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this brand?')) return
    await fetch(`/api/v2/brands/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCreating(!creating)}
        className="inline-flex items-center min-h-[36px] px-3 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
      >
        + Add brand
      </button>

      {creating && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Brand name"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={saving}
            className="min-h-[40px] px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="min-h-[40px] px-3 text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </form>
      )}

      {brands.length === 0 ? (
        <p className="text-sm text-slate-400">No brands yet.</p>
      ) : (
        <div className="space-y-2">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3"
            >
              <span className="flex-1 font-medium text-slate-900 text-sm">{brand.name}</span>
              <span className="text-xs text-slate-400 font-mono">{brand.slug}</span>
              <button
                onClick={() => handleDelete(brand.id)}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
