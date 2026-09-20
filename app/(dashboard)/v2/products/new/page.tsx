import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2ProductForm } from '../product-form'

export default async function V2NewProductPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">New product</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Fill in the details and save as draft. You can publish later.
        </p>
      </div>
      <V2ProductForm />
    </div>
  )
}
