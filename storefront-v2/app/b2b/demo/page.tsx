import type { Metadata } from 'next'
import Link from 'next/link'
import { B2BCatalogPageClient } from '@/components/b2b-catalog-page-client'

export const metadata: Metadata = {
  title: 'Demo catalogo B2B',
}

export default async function B2BDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-600">Link demo non valido.</p>
        <Link href="/b2b/login" className="text-indigo-600 text-sm hover:underline">
          Accedi come cliente registrato
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <B2BCatalogPageClient mode="demo" demoToken={token} />
      <p className="text-center text-sm text-slate-500">
        <Link href="/b2b/login" className="text-indigo-600 hover:underline">
          Sei già cliente? Accedi qui
        </Link>
      </p>
    </main>
  )
}
