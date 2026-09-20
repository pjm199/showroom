import { apiUrl } from '@/lib/api'
import { notFound } from 'next/navigation'
import { HeroSection } from '@/components/sections/hero-section'
import { CarouselSection } from '@/components/sections/carousel-section'
import { FeaturedGridSection } from '@/components/sections/featured-grid-section'
import { PromoBannerSection } from '@/components/sections/promo-banner-section'
import { CollectionHighlightSection } from '@/components/sections/collection-highlight-section'
import type { RenderedSection } from '@/types/v2'

export const dynamic = 'force-dynamic'

const SECTION_MAP: Record<string, React.ComponentType<{ section: RenderedSection }>> = {
  'hero': HeroSection,
  'carousel': CarouselSection,
  'featured-grid': FeaturedGridSection,
  'promo-banner': PromoBannerSection,
  'collection-highlight': CollectionHighlightSection,
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) notFound()

  // NOTE: Preview rendering is handled by the storefront server reading the
  // PageVersion directly via the token. For MVP, this page shows a banner
  // indicating preview mode and delegates rendering to the API.
  // Full preview rendering implementation is done in Phase 4 completion.

  return (
    <main>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <p className="text-sm text-amber-800 text-center font-medium">
          Preview mode — this page is not publicly visible
        </p>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 text-sm">
          Preview token: <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{token}</code>
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Preview rendering connects to the Vetrina API using this token.
        </p>
      </div>
    </main>
  )
}
