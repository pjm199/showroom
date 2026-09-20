'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  B2BAccessInviteV2,
  B2BCatalogV2,
  B2BClientV2,
  B2BOrderV2,
  B2BClientPriceOverrideV2,
  ProductV2,
} from '@/types/v2'

type Tab = 'catalogs' | 'clients' | 'invites' | 'orders'

type CatalogDetail = B2BCatalogV2 & {
  items?: {
    id: string
    productId: string
    sortOrder: number
    notes: string | null
    customPriceCents: number | null
    product?: { id: string; title: string; slug: string; priceCents: number | null }
  }[]
}

type ClientDetail = B2BClientV2 & {
  customerGroup?: { id: string; name: string } | null
  assignedCatalog?: { id: string; name: string; slug: string } | null
  priceOverrides?: B2BClientPriceOverrideV2[]
}

function formatPrice(cents: number | null | undefined) {
  if (cents == null) return '—'
  return `€${(cents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })
}

export function V2B2BClient() {
  const [tab, setTab] = useState<Tab>('catalogs')
  const [catalogs, setCatalogs] = useState<(B2BCatalogV2 & { _count?: { items: number } })[]>([])
  const [clients, setClients] = useState<(B2BClientV2 & { _count?: { priceOverrides: number } })[]>([])
  const [invites, setInvites] = useState<B2BAccessInviteV2[]>([])
  const [orders, setOrders] = useState<B2BOrderV2[]>([])
  const [products, setProducts] = useState<ProductV2[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogDetail | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null)
  const [error, setError] = useState('')

  const loadCatalogs = useCallback(async () => {
    const res = await fetch('/api/v2/b2b/catalogs')
    if (res.ok) {
      const json = await res.json()
      setCatalogs(json.data ?? [])
    }
  }, [])

  const loadClients = useCallback(async () => {
    const res = await fetch('/api/v2/b2b/clients')
    if (res.ok) {
      const json = await res.json()
      setClients(json.data ?? [])
    }
  }, [])

  const loadInvites = useCallback(async () => {
    const res = await fetch('/api/v2/b2b/invites')
    if (res.ok) {
      const json = await res.json()
      setInvites(json.data ?? [])
    }
  }, [])

  const loadOrders = useCallback(async () => {
    const res = await fetch('/api/v2/b2b/orders')
    if (res.ok) {
      const json = await res.json()
      setOrders(json.data ?? [])
    }
  }, [])

  const loadProducts = useCallback(async () => {
    const res = await fetch('/api/v2/products?limit=100&displayStatus=ACTIVE')
    if (res.ok) {
      const json = await res.json()
      setProducts(json.data ?? [])
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    await Promise.all([loadCatalogs(), loadClients(), loadInvites(), loadOrders(), loadProducts()])
    setLoading(false)
  }, [loadCatalogs, loadClients, loadInvites, loadOrders, loadProducts])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function openCatalog(id: string) {
    const res = await fetch(`/api/v2/b2b/catalogs/${id}`)
    if (res.ok) {
      const json = await res.json()
      setSelectedCatalog(json.data)
    }
  }

  async function openClient(id: string) {
    const res = await fetch(`/api/v2/b2b/clients/${id}`)
    if (res.ok) {
      const json = await res.json()
      setSelectedClient(json.data)
    }
  }

  async function createCatalog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/v2/b2b/catalogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        description: fd.get('description') || undefined,
        requestOrderEnabled: fd.get('requestOrderEnabled') === 'on',
      }),
    })
    if (!res.ok) {
      setError('Could not create catalog')
      return
    }
    e.currentTarget.reset()
    loadCatalogs()
  }

  async function createClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/v2/b2b/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: fd.get('companyName'),
        contactName: fd.get('contactName') || undefined,
        email: fd.get('email'),
        password: fd.get('password') || undefined,
        assignedCatalogId: fd.get('assignedCatalogId') || undefined,
      }),
    })
    if (!res.ok) {
      setError('Could not create client')
      return
    }
    e.currentTarget.reset()
    loadClients()
  }

  async function createInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/v2/b2b/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogId: fd.get('catalogId') || undefined,
        label: fd.get('label') || undefined,
        expiresInHours: Number(fd.get('expiresInHours') || 48),
      }),
    })
    if (!res.ok) {
      setError('Could not create demo link')
      return
    }
    e.currentTarget.reset()
    loadInvites()
  }

  async function addProductToCatalog(productId: string) {
    if (!selectedCatalog) return
    await fetch(`/api/v2/b2b/catalogs/${selectedCatalog.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    openCatalog(selectedCatalog.id)
    loadCatalogs()
  }

  async function setClientPrice(productId: string, priceEuros: string) {
    if (!selectedClient) return
    const priceCents = Math.round(parseFloat(priceEuros) * 100)
    if (Number.isNaN(priceCents)) return
    await fetch(`/api/v2/b2b/clients/${selectedClient.id}/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, priceCents }),
    })
    openClient(selectedClient.id)
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await fetch(`/api/v2/b2b/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadOrders()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'catalogs', label: 'Cataloghi' },
    { id: 'clients', label: 'Clienti B2B' },
    { id: 'invites', label: 'Link demo' },
    { id: 'orders', label: 'Ordini' },
  ]

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-sm">Loading B2B…</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-[40px] px-4 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      {tab === 'catalogs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <form onSubmit={createCatalog} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold text-slate-900">Nuovo catalogo</h2>
              <input name="name" required placeholder="Nome catalogo" className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm" />
              <textarea name="description" placeholder="Descrizione" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="requestOrderEnabled" />
                Abilita richieste ordine
              </label>
              <button type="submit" className="min-h-[44px] px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium">Crea catalogo</button>
            </form>

            <div className="space-y-2">
              {catalogs.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => openCatalog(cat.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                    selectedCatalog?.id === cat.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">{cat.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {cat._count?.items ?? 0} prodotti · {cat.isActive ? 'attivo' : 'inattivo'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
            {selectedCatalog ? (
              <>
                <h2 className="font-semibold text-slate-900">{selectedCatalog.name}</h2>
                <p className="text-sm text-slate-500">{selectedCatalog.description}</p>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700">Prodotti nel catalogo</h3>
                  {(selectedCatalog.items ?? []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b border-slate-100 py-2">
                      <span>{item.product?.title ?? item.productId}</span>
                      <span className="text-slate-500">{formatPrice(item.customPriceCents ?? item.product?.priceCents)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Aggiungi prodotto</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {products
                      .filter((p) => !(selectedCatalog.items ?? []).some((i) => i.productId === p.id))
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProductToCatalog(p.id)}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50"
                        >
                          + {p.title}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Seleziona un catalogo per gestire i prodotti.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <form onSubmit={createClient} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold text-slate-900">Nuovo cliente B2B</h2>
              <input name="companyName" required placeholder="Ragione sociale" className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm" />
              <input name="contactName" placeholder="Referente" className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm" />
              <input name="email" type="email" required placeholder="Email login" className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm" />
              <input name="password" type="password" placeholder="Password (min 6)" minLength={6} className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm" />
              <select name="assignedCatalogId" className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm">
                <option value="">— Catalogo assegnato —</option>
                {catalogs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="submit" className="min-h-[44px] px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium">Crea cliente</button>
            </form>

            <div className="space-y-2">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => openClient(client.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                    selectedClient?.id === client.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">{client.companyName}</div>
                  <div className="text-xs text-slate-400 mt-1">{client.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
            {selectedClient ? (
              <>
                <h2 className="font-semibold text-slate-900">{selectedClient.companyName}</h2>
                <p className="text-sm text-slate-500">{selectedClient.email}</p>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Prezzi personalizzati</h3>
                  {(selectedClient.priceOverrides ?? []).map((po) => (
                    <div key={po.id} className="flex justify-between text-sm py-1">
                      <span>{po.product?.title ?? po.productId}</span>
                      <span className="font-medium">{formatPrice(po.priceCents)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Imposta prezzo prodotto</h3>
                  {products.slice(0, 20).map((p) => (
                    <div key={p.id} className="flex items-center gap-2 py-1">
                      <span className="flex-1 text-sm truncate">{p.title}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="€"
                        className="w-24 min-h-[36px] rounded-lg border border-slate-200 px-2 text-sm"
                        onBlur={(e) => {
                          if (e.target.value) setClientPrice(p.id, e.target.value)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Seleziona un cliente per gestire i prezzi.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'invites' && (
        <div className="space-y-4">
          <form onSubmit={createInvite} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 max-w-lg">
            <h2 className="font-semibold text-slate-900">Nuovo link demo</h2>
            <select name="catalogId" required className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm">
              <option value="">— Catalogo —</option>
              {catalogs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input name="label" placeholder="Etichetta (es. Demo fiera)" className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm" />
            <input name="expiresInHours" type="number" defaultValue={48} min={1} placeholder="Ore validità" className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm" />
            <button type="submit" className="min-h-[44px] px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium">Genera link</button>
          </form>

          <div className="space-y-2">
            {invites.map((inv) => (
              <div key={inv.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="font-medium text-slate-900">{inv.label ?? 'Link demo'}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Scade: {formatDate(inv.expiresAt)} · Usi: {inv.useCount}{inv.maxUses != null ? `/${inv.maxUses}` : ''}
                </div>
                <code className="block mt-2 text-xs bg-slate-50 p-2 rounded-lg break-all">/b2b/demo?token={inv.token}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Nessun ordine B2B.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-900">{order.customerName}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {order.client?.companyName ?? 'Prospect demo'} · {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="min-h-[36px] rounded-lg border border-slate-200 px-2 text-sm"
                  >
                    <option value="PENDING">In attesa</option>
                    <option value="ACCEPTED">Accettato</option>
                    <option value="COMPLETED">Completato</option>
                    <option value="CANCELLED">Annullato</option>
                  </select>
                </div>
                <ul className="mt-3 space-y-1">
                  {(order.items as B2BOrderV2['items']).map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex justify-between">
                      <span>{item.quantity}× {item.title}</span>
                      <span>{formatPrice(item.priceCents != null ? item.priceCents * item.quantity : null)}</span>
                    </li>
                  ))}
                </ul>
                {order.notes && <p className="text-xs text-slate-500 mt-2">{order.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
