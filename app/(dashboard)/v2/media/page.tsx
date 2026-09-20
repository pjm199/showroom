import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2MediaClient } from './media-client'

export default async function V2MediaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Media Library</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Upload and organize images for products, pages, and sections.
        </p>
      </div>
      <V2MediaClient />
    </div>
  )
}
