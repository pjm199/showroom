import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function V2DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const cards = [
    {
      href: '/v2/products',
      title: 'Products',
      description: 'Create, enrich, and manage your product catalog',
    },
    {
      href: '/v2/collections',
      title: 'Collections',
      description: 'Curate seasonal, promo, and editorial product groups',
    },
    {
      href: '/v2/publication',
      title: 'Publication',
      description: 'Control where and when your content is visible',
    },
    {
      href: '/v2/composer',
      title: 'Site Composer',
      description: 'Build your homepage and landing pages section by section',
    },
    {
      href: '/v2/media',
      title: 'Media Library',
      description: 'Upload and organize images, covers, and banners',
    },
    {
      href: '/v2/b2b',
      title: 'B2B Catalogs',
      description: 'Create private catalogs for professional clients',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vetrina V2</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Commercial publishing console — authoring, publication, and site composition.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-slate-900 text-base">{card.title}</h2>
            <p className="text-slate-500 text-sm mt-1">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
