import type { RenderedSection, ProductCardViewModel } from '@/types/v2'
import { ProductCard } from '@/components/product-card'

export function CarouselSection({ section }: { section: RenderedSection }) {
  const config = section.config as {
    title?: string
    subtitle?: string
    itemsPerView?: number
    showPrices?: boolean
    showBadges?: boolean
  }

  const products = (section.bindings['products'] as ProductCardViewModel[] | undefined) ?? []

  if (products.length === 0) return null

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {config.title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
            {config.subtitle && <p className="text-slate-500 mt-1">{config.subtitle}</p>}
          </div>
        )}
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          {products.map((product) => (
            <div key={product.id} className="shrink-0 w-[200px] sm:w-[220px]">
              <ProductCard
                product={{
                  ...product,
                  priceCents: config.showPrices === false ? null : product.priceCents,
                  badges: config.showBadges === false ? [] : product.badges,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
