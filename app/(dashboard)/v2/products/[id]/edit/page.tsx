import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { V2ProductForm } from '../../product-form'

export default async function V2EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/v2/products/${id}`,
    { cache: 'no-store' }
  )

  if (!res.ok) redirect('/v2/products')

  const { data: product } = await res.json()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Edit product</h1>
        <p className="text-slate-500 text-sm mt-0.5 truncate">{product.title}</p>
      </div>
      <V2ProductForm product={product} />
    </div>
  )
}
