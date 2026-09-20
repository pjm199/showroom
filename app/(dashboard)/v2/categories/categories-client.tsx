'use client'

import { useEffect, useState } from 'react'
import type { CategoryV2 } from '@/types/v2'

export function V2CategoriesClient() {
  const [categories, setCategories] = useState<CategoryV2[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/v2/categories')
    if (res.ok) {
      const json = await res.json()
      setCategories(json.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    await fetch('/api/v2/categories', {
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
    if (!confirm('Delete this category?')) return
    await fetch(`/api/v2/categories/${id}`, { method: 'DELETE' })
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
        + Add category
      </button>

      {creating && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
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

      {categories.length === 0 ? (
        <p className="text-sm text-slate-400">No categories yet.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3"
            >
              <div className="flex-1">
                <span className="font-medium text-slate-900 text-sm">{cat.name}</span>
                {cat.parentId && (
                  <span className="text-xs text-slate-400 ml-2">nested</span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">{cat.slug}</span>
              <button
                onClick={() => handleDelete(cat.id)}
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
