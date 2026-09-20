import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2CollectionForm } from '../collection-form'

export default async function V2NewCollectionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">New collection</h1>
      </div>
      <V2CollectionForm />
    </div>
  )
}
