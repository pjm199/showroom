import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2B2BClient } from './b2b-client'

export default async function V2B2BPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">B2B Catalogs</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Cataloghi professionali, clienti, link demo e ordini B2B.
        </p>
      </div>
      <V2B2BClient />
    </div>
  )
}
