import Image from 'next/image'
import type { RenderedSection, MediaViewModel } from '@/types/v2'

export function PromoBannerSection({ section }: { section: RenderedSection }) {
  const config = section.config as {
    headline?: string
    subheadline?: string
    ctaLabel?: string
    ctaUrl?: string
    layout?: 'full' | 'half-left' | 'half-right'
    backgroundColor?: string
  }

  const bannerImage = section.bindings['bannerImage'] as MediaViewModel | null | undefined
  const layout = config.layout ?? 'full'

  const bgStyle = !bannerImage && config.backgroundColor
    ? { backgroundColor: config.backgroundColor }
    : {}

  return (
    <section className="py-6">
      <div className={`max-w-6xl mx-auto px-4 ${layout === 'full' ? '' : 'flex gap-4'}`}>
        <div
          className={`relative overflow-hidden rounded-3xl flex items-center ${
            layout === 'full' ? 'w-full min-h-[200px]' : 'flex-1 min-h-[200px]'
          } ${!bannerImage ? 'bg-slate-800' : ''}`}
          style={bgStyle}
        >
          {bannerImage && (
            <Image
              src={bannerImage.url}
              alt={bannerImage.altText ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 px-8 py-10 max-w-xl">
            {config.headline && (
              <h2 className="text-2xl md:text-3xl font-bold text-white">{config.headline}</h2>
            )}
            {config.subheadline && (
              <p className="text-white/80 mt-2">{config.subheadline}</p>
            )}
            {config.ctaLabel && (
              <a
                href={config.ctaUrl ?? '#'}
                className="inline-flex mt-4 items-center px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-xl text-sm hover:bg-slate-100 transition-colors"
              >
                {config.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
