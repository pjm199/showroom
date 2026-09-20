import Image from 'next/image'
import type { RenderedSection, MediaViewModel } from '@/types/v2'

export function HeroSection({ section }: { section: RenderedSection }) {
  const config = section.config as {
    headline?: string
    subheadline?: string
    ctaLabel?: string
    ctaUrl?: string
    overlay?: boolean
    textAlign?: 'left' | 'center' | 'right'
  }

  const bgMedia = section.bindings['backgroundMedia'] as MediaViewModel | null | undefined

  const textAlignClass =
    config.textAlign === 'center'
      ? 'text-center items-center'
      : config.textAlign === 'right'
      ? 'text-right items-end'
      : 'text-left items-start'

  return (
    <section className="relative min-h-[60vh] flex items-end overflow-hidden bg-slate-900">
      {bgMedia && (
        <Image
          src={bgMedia.url}
          alt={bgMedia.altText ?? ''}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}

      {config.overlay !== false && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      )}

      <div className={`relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col gap-4 ${textAlignClass} w-full`}>
        {config.headline && (
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-3xl">
            {config.headline}
          </h1>
        )}
        {config.subheadline && (
          <p className="text-xl text-white/80 max-w-2xl">{config.subheadline}</p>
        )}
        {config.ctaLabel && (
          <a
            href={config.ctaUrl ?? '#'}
            className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors w-fit"
          >
            {config.ctaLabel}
          </a>
        )}
      </div>
    </section>
  )
}
