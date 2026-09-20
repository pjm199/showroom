import type { Metadata } from 'next'
import { shopApiUrl } from '@/lib/api'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { ProductPageViewModel } from '@/types/v2'

export const revalidate = 120

async function getProduct(slug: string): Promise<ProductPageViewModel | null> {
  try {
    const res = await fetch(shopApiUrl(`/products/${slug}`), { next: { revalidate: 120 } })
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
  const data = await getProduct(slug)
  return {
    title: data?.seo.title ?? slug,
    description: data?.seo.description ?? undefined,
    openGraph: { images: data?.seo.ogImage ? [data.seo.ogImage] : [] },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getProduct(slug)
  if (!data) notFound()

  const { product, breadcrumbs } = data

  const coverMedia = product.media[0] ?? null
  const galleryMedia = product.media.slice(1)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            {i < breadcrumbs.length - 1 ? (
              <a href={crumb.href} className="hover:text-slate-600">
                {crumb.label}
              </a>
            ) : (
              <span className="text-slate-600">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Media */}
        <div className="space-y-3">
          {coverMedia && (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src={coverMedia.url}
                alt={coverMedia.altText ?? product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          {galleryMedia.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryMedia.slice(0, 4).map((m, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden bg-slate-100"
                >
                  <Image
                    src={m.url}
                    alt={m.altText ?? ''}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.brand && (
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
              {product.brand.name}
            </p>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">{product.title}</h1>
            {product.shortDescription && (
              <p className="text-slate-600 mt-2">{product.shortDescription}</p>
            )}
          </div>

          {product.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {product.priceCents != null && (
            <p className="text-3xl font-bold text-slate-900">
              €{(product.priceCents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
          )}

          {product.highlights.length > 0 && (
            <ul className="space-y-2">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {product.isPurchasable && (
            <button className="w-full min-h-[52px] bg-indigo-600 text-white text-base font-semibold rounded-2xl hover:bg-indigo-700 transition-colors">
              Order / Contact
            </button>
          )}

          {product.longDescription && (
            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Description</h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.longDescription}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(product.structuredData),
        }}
      />
    </main>
  )
}
