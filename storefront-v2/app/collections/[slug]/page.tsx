import type { Metadata } from 'next'
import { shopApiUrl } from '@/lib/api'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ProductCard } from '@/components/product-card'
import type { CollectionPageViewModel } from '@/types/v2'

export const revalidate = 120

async function getCollection(slug: string): Promise<CollectionPageViewModel | null> {
  try {
    const res = await fetch(shopApiUrl(`/collections/${slug}`), { next: { revalidate: 120 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getCollection(slug)
  return {
    title: data?.seo.title ?? slug,
    description: data?.seo.description ?? undefined,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getCollection(slug)
  if (!data) notFound()

  const { collection, products } = data

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-slate-100">
        {collection.heroMedia && (
          <Image
            src={collection.heroMedia.url}
            alt={collection.heroMedia.altText ?? collection.name}
            width={1200}
            height={400}
            className="w-full object-cover h-64 md:h-96"
          />
        )}
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
          <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
          {collection.subtitle && (
            <p className="text-white/80 mt-2">{collection.subtitle}</p>
          )}
        </div>
      </div>

      {/* Products */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-12">
          No products in this collection yet.
        </p>
      )}
    </main>
  )
}
