import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2CollectionsClient } from './collections-client'
import Link from 'next/link'

export default async function V2CollectionsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Collections</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Curate seasonal, promotional, and editorial product groups.
          </p>
        </div>
        <Link
          href="/v2/collections/new"
          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New collection
        </Link>
      </div>
      <V2CollectionsClient />
    </div>
  )
}
