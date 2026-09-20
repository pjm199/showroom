'use client'

import { useEffect, useState } from 'react'
import type { MediaAssetV2 } from '@/types/v2'
import Image from 'next/image'

export function V2MediaClient() {
  const [assets, setAssets] = useState<MediaAssetV2[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: '40' })
    if (search) params.set('search', search)
    const res = await fetch(`/api/v2/media?${params}`)
    if (res.ok) {
      const json = await res.json()
      setAssets(json.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Upload via existing V1 blob route (shared)
    const form = new FormData()
    form.append('file', file)
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
    if (!uploadRes.ok) {
      setUploading(false)
      return
    }

    const { url } = await uploadRes.json()

    // Register in V2 media library
    await fetch('/api/v2/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        mimeType: file.type,
        sizeBytes: file.size,
        altText: file.name.replace(/\.[^/.]+$/, ''),
      }),
    })

    setUploading(false)
    load()
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="search"
          placeholder="Search by alt text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <label className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 cursor-pointer transition-colors">
          {uploading ? 'Uploading…' : '+ Upload'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
      ) : assets.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No media yet. Upload your first image above.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
            >
              <Image
                src={asset.url}
                alt={asset.altText ?? ''}
                fill
                className="object-cover"
                sizes="160px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[10px] truncate leading-none">
                  {asset.altText ?? asset.url.split('/').pop()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
