import type { Metadata } from 'next'
import { B2BLoginForm } from '@/components/b2b-login-form'

export const metadata: Metadata = {
  title: 'Accesso B2B',
}

export default function B2BLoginPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Area riservata B2B</h1>
        <p className="text-sm text-slate-500">Accedi per vedere il tuo catalogo e i prezzi dedicati.</p>
      </div>
      <B2BLoginForm />
    </main>
  )
}
