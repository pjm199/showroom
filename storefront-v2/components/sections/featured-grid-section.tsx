import type { RenderedSection, ProductCardViewModel } from '@/types/v2'
import { ProductCard } from '@/components/product-card'

export function FeaturedGridSection({ section }: { section: RenderedSection }) {
  const config = section.config as {
    title?: string
    subtitle?: string
    columns?: 2 | 3 | 4
    showPrices?: boolean
    showBadges?: boolean
  }

  const products = (section.bindings['products'] as ProductCardViewModel[] | undefined) ?? []
  if (products.length === 0) return null

  const columns = config.columns ?? 3
  const colClass =
    columns === 4
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : columns === 2
      ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3'

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {config.title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
            {config.subtitle && <p className="text-slate-500 mt-1">{config.subtitle}</p>}
          </div>
        )}
        <div className={`grid ${colClass} gap-4`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                priceCents: config.showPrices === false ? null : product.priceCents,
                badges: config.showBadges === false ? [] : product.badges,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
