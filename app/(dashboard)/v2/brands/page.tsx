import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2BrandsClient } from './brands-client'

export default async function V2BrandsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Brands</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage the brands associated with your products.
          </p>
        </div>
      </div>
      <V2BrandsClient />
    </div>
  )
}
