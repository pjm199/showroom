'use client'

import { useEffect, useState } from 'react'
import type { PageVersionDetailV2, SectionTypeV2 } from '@/types/v2'

type Props = { pageId: string }

const SECTION_TYPE_ICONS: Record<string, string> = {
  'hero': '🖼️',
  'carousel': '🎠',
  'featured-grid': '⊞',
  'promo-banner': '📢',
  'collection-highlight': '✨',
}

export function V2ComposerEditor({ pageId }: Props) {
  const [version, setVersion] = useState<PageVersionDetailV2 | null>(null)
  const [sectionTypes, setSectionTypes] = useState<SectionTypeV2[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [addingSection, setAddingSection] = useState(false)

  async function load() {
    setLoading(true)
    const [versionsRes, typesRes] = await Promise.all([
      fetch(`/api/v2/composer/pages/${pageId}/versions`),
      fetch('/api/v2/composer/section-types'),
    ])

    if (versionsRes.ok) {
      const versionsJson = await versionsRes.json()
      const versions: PageVersionDetailV2[] = versionsJson.data ?? []
      const draft = versions.find((v) => v.status === 'DRAFT')
      if (draft) {
        const detailRes = await fetch(
          `/api/v2/composer/pages/${pageId}/versions`
        )
        if (detailRes.ok) {
          // Use the draft version — need to fetch with sections
          setVersion(draft)
        }
      }
    }

    if (typesRes.ok) {
      const typesJson = await typesRes.json()
      setSectionTypes(typesJson.data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => { load() }, [pageId])

  async function addSection(sectionTypeId: string) {
    if (!version) return
    setAddingSection(true)
    await fetch(
      `/api/v2/composer/versions/${version.id}/sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionTypeId }),
      }
    )
    setAddingSection(false)
    load()
  }

  async function toggleSection(sectionId: string, isEnabled: boolean) {
    if (!version) return
    await fetch(
      `/api/v2/composer/versions/${version.id}/sections/${sectionId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
      }
    )
    load()
  }

  async function deleteSection(sectionId: string) {
    if (!version || !confirm('Remove this section?')) return
    await fetch(
      `/api/v2/composer/versions/${version.id}/sections/${sectionId}`,
      { method: 'DELETE' }
    )
    load()
  }

  async function publish() {
    if (!version) return
    setPublishing(true)
    await fetch(
      `/api/v2/composer/pages/${pageId}/versions/${version.id}/publish`,
      { method: 'POST' }
    )
    setPublishing(false)
    load()
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading composer…</div>
  }

  if (!version) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        No draft version found.{' '}
        <button
          onClick={async () => {
            await fetch(`/api/v2/composer/pages/${pageId}/versions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ label: 'Initial draft' }),
            })
            load()
          }}
          className="text-indigo-600 hover:underline"
        >
          Create draft
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {version.label ?? 'Draft'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {version.sections.length} section{version.sections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={publish}
          disabled={publishing}
          className="min-h-[40px] px-5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {publishing ? 'Publishing…' : 'Publish'}
        </button>
      </div>

      {/* Sections list */}
      <div className="space-y-2">
        {version.sections.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
            No sections yet. Add one below.
          </div>
        ) : (
          version.sections
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((section) => (
              <div
                key={section.id}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 border transition-colors ${
                  section.isEnabled
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {SECTION_TYPE_ICONS[section.sectionTypeId] ?? '⬜'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-900">
                    {section.label ?? section.sectionTypeId}
                  </span>
                  <span className="ml-2 text-xs text-slate-400 font-mono">
                    {section.sectionTypeId}
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {section.bindings.length} binding{section.bindings.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSection(section.id, !section.isEnabled)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      section.isEnabled
                        ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                    }`}
                  >
                    {section.isEnabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="text-xs px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Add section */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Add section</p>
        <div className="flex flex-wrap gap-2">
          {sectionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => addSection(type.id)}
              disabled={addingSection}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-700 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
            >
              <span>{SECTION_TYPE_ICONS[type.id] ?? '⬜'}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
