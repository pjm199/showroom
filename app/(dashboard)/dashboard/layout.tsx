import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { shopSlug?: string };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[56px] items-center justify-between px-4 gap-3">
          <Link
            href="/dashboard/orders"
            className="font-semibold text-slate-800 text-lg py-2 -my-2 hover:text-slate-900"
          >
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-colors"
            >
              Profile
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <nav className="sticky top-[56px] z-10 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex gap-1.5 max-w-2xl mx-auto">
          <Link
            href="/dashboard/orders"
            className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-colors px-3"
          >
            Orders
          </Link>
          <Link
            href="/dashboard/categories"
            className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent hover:border-slate-200 transition-colors px-3"
          >
            Categories
          </Link>
          <Link
            href="/dashboard/products"
            className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent hover:border-slate-200 transition-colors px-3"
          >
            Products
          </Link>
          {user.shopSlug && (
            <Link
              href={`/s/${user.shopSlug}`}
              className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent hover:border-slate-200 transition-colors px-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Storefront
            </Link>
          )}
        </div>
      </nav>
      <main className="flex-1 p-4 pb-8">{children}</main>
    </div>
  );
}
