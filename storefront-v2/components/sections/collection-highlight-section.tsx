import Image from 'next/image'
import Link from 'next/link'
import type { RenderedSection, CollectionSummaryViewModel, ProductCardViewModel } from '@/types/v2'
import { ProductCard } from '@/components/product-card'

export function CollectionHighlightSection({ section }: { section: RenderedSection }) {
  const config = section.config as {
    title?: string
    subtitle?: string
    ctaLabel?: string
    previewCount?: number
  }

  const collection = section.bindings['collection'] as CollectionSummaryViewModel | null | undefined
  if (!collection) return null

  const products = (section.bindings['products'] as ProductCardViewModel[] | undefined) ?? []
  const previewProducts = products.slice(0, config.previewCount ?? 4)

  const heroMedia = section.bindings['heroMedia'] as { url: string; altText: string | null } | null | undefined
    ?? collection.heroMedia

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {config.title ?? collection.name}
            </h2>
            {(config.subtitle ?? collection.subtitle) && (
              <p className="text-slate-500 mt-1">{config.subtitle ?? collection.subtitle}</p>
            )}
          </div>
          <Link
            href={`/collections/${collection.slug}`}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            {config.ctaLabel ?? 'View all'} →
          </Link>
        </div>

        {heroMedia && (
          <div className="relative rounded-2xl overflow-hidden h-48 mb-6 bg-slate-200">
            <Image
              src={heroMedia.url}
              alt={heroMedia.altText ?? collection.name}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        )}

        {previewProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
