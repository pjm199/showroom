import type { Metadata } from 'next'
import { B2BCatalogPageClient } from '@/components/b2b-catalog-page-client'
import { B2BLogoutButton } from '@/components/b2b-logout-button'

export const metadata: Metadata = {
  title: 'Catalogo B2B',
}

export default function B2BCatalogPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <B2BLogoutButton />
      </div>
      <B2BCatalogPageClient mode="authenticated" />
    </main>
  )
}
