import Image from 'next/image'
import Link from 'next/link'
import type { ProductCardViewModel } from '@/types/v2'

export function ProductCard({ product }: { product: ProductCardViewModel }) {
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group block rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white"
    >
      {/* Cover image */}
      <div className="relative aspect-square bg-slate-50">
        {product.coverMedia ? (
          <Image
            src={product.coverMedia.url}
            alt={product.coverMedia.altText ?? product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
        )}

        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-bold bg-white/90 text-slate-800 px-1.5 py-0.5 rounded shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {product.brand && (
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">
            {product.brand.name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
          {product.title}
        </h3>
        {product.priceCents != null && (
          <p className="text-sm font-bold text-slate-900 mt-1.5">
            €{(product.priceCents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>
    </Link>
  )
}
