import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function V2DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-200">
          <span className="font-bold text-slate-900 text-base tracking-tight">
            Vetrina
          </span>
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 ml-auto">
            v2
          </span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <V2NavLink href="/v2" exact label="Dashboard" />
          <V2NavLink href="/v2/products" label="Products" />
          <V2NavLink href="/v2/brands" label="Brands" />
          <V2NavLink href="/v2/categories" label="Categories" />
          <V2NavLink href="/v2/collections" label="Collections" />
          <div className="my-2 border-t border-slate-100" />
          <V2NavLink href="/v2/publication" label="Publication" />
          <V2NavLink href="/v2/media" label="Media" />
          <div className="my-2 border-t border-slate-100" />
          <V2NavLink href="/v2/composer" label="Site Composer" />
          <V2NavLink href="/v2/b2b" label="B2B Catalogs" />
        </nav>

        <div className="px-3 py-3 border-t border-slate-200 space-y-2">
          <Link
            href="/dashboard"
            className="block w-full text-center text-xs text-slate-500 hover:text-slate-700 py-1.5 rounded-lg hover:bg-slate-50"
          >
            ← V1 Dashboard
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
          <div className="flex min-h-[56px] items-center justify-between px-4 gap-3">
            <span className="font-bold text-slate-900">
              Vetrina{' '}
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5">
                v2
              </span>
            </span>
            <SignOutButton />
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-2 py-1.5 flex gap-1">
          <V2BottomNavLink href="/v2/products" label="Products" />
          <V2BottomNavLink href="/v2/collections" label="Collections" />
          <V2BottomNavLink href="/v2/publication" label="Publish" />
          <V2BottomNavLink href="/v2/composer" label="Composer" />
          <V2BottomNavLink href="/v2/media" label="Media" />
        </nav>

        <main className="flex-1 px-4 py-6 pb-24 lg:pb-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

function V2NavLink({
  href,
  label,
  exact,
}: {
  href: string
  label: string
  exact?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
    >
      {label}
    </Link>
  )
}

function V2BottomNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center min-h-[48px] text-xs font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
    >
      {label}
    </Link>
  )
}
