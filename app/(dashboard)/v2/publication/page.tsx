import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2PublicationClient } from './publication-client'

export default async function V2PublicationPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Publication</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Control where and when your products and pages are visible.
        </p>
      </div>
      <V2PublicationClient />
    </div>
  )
}
