import type { Metadata } from 'next'
import { shopApiUrl, getShopSlug } from '@/lib/api'
import { notFound } from 'next/navigation'
import { HeroSection } from '@/components/sections/hero-section'
import { CarouselSection } from '@/components/sections/carousel-section'
import { FeaturedGridSection } from '@/components/sections/featured-grid-section'
import { PromoBannerSection } from '@/components/sections/promo-banner-section'
import { CollectionHighlightSection } from '@/components/sections/collection-highlight-section'
import type { HomepageViewModel, RenderedSection } from '@/types/v2'

export const revalidate = 60

async function getHomepage(): Promise<HomepageViewModel | null> {
  try {
    const res = await fetch(shopApiUrl('/homepage'), { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomepage()
  return {
    title: data?.seo.title ?? 'Home',
    description: data?.seo.description ?? undefined,
    openGraph: {
      images: data?.seo.ogImage ? [data.seo.ogImage] : [],
    },
  }
}

const SECTION_MAP: Record<string, React.ComponentType<{ section: RenderedSection }>> = {
  'hero': HeroSection,
  'carousel': CarouselSection,
  'featured-grid': FeaturedGridSection,
  'promo-banner': PromoBannerSection,
  'collection-highlight': CollectionHighlightSection,
}

export default async function HomePage() {
  const data = await getHomepage()
  if (!data) notFound()

  return (
    <main>
      <StorefrontHeader shop={data.shop} />
      {data.sections.map((section) => {
        const Component = SECTION_MAP[section.type]
        if (!Component) return null
        return <Component key={section.id} section={section} />
      })}
      <StorefrontFooter shop={data.shop} />
    </main>
  )
}

function StorefrontHeader({ shop }: { shop: HomepageViewModel['shop'] }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <a href="/" className="font-bold text-slate-900 text-lg">
          {shop.name}
        </a>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {shop.whatsapp && (
            <a
              href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition-colors"
            >
              WhatsApp
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}

function StorefrontFooter({ shop }: { shop: HomepageViewModel['shop'] }) {
  return (
    <footer className="border-t border-slate-200 mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 text-sm text-slate-400">
        <p>{shop.name}</p>
        {shop.address && <p className="mt-1">{shop.address}</p>}
      </div>
    </footer>
  )
}
