import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2CategoriesClient } from './categories-client'

export default async function V2CategoriesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your product taxonomy.
        </p>
      </div>
      <V2CategoriesClient />
    </div>
  )
}
