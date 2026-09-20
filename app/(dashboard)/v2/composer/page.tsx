import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { V2ComposerClient } from './composer-client'

export default async function V2ComposerPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Site Composer</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Build your homepage and commercial pages section by section.
          </p>
        </div>
        <Link
          href="/v2/composer/new"
          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New page
        </Link>
      </div>
      <V2ComposerClient />
    </div>
  )
}
