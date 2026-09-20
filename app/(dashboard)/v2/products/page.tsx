import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { V2ProductsClient } from './products-client'

export default async function V2ProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Create, enrich, and publish your commercial catalog.
          </p>
        </div>
        <Link
          href="/v2/products/new"
          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New product
        </Link>
      </div>

      <V2ProductsClient />
    </div>
  )
}
