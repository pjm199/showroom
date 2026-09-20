import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2PageForm } from '../page-form'

export default async function V2NewPagePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">New page</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Create a page to compose with sections.
        </p>
      </div>
      <V2PageForm />
    </div>
  )
}
