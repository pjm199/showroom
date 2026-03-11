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
        <div className="flex min-h-[56px] items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="font-semibold text-slate-800 text-lg py-2 -my-2"
          >
            Dashboard
          </Link>
          <SignOutButton />
        </div>
      </header>
      <nav className="sticky top-[56px] z-10 border-b border-slate-200 bg-white flex gap-0">
        <Link
          href="/dashboard/profile"
          className="flex-1 min-h-[48px] flex items-center justify-center text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 px-4"
        >
          Profile
        </Link>
        {user.shopSlug && (
          <Link
            href={`/s/${user.shopSlug}`}
            className="flex-1 min-h-[48px] flex items-center justify-center text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 px-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Storefront
          </Link>
        )}
      </nav>
      <main className="flex-1 p-4 pb-8">{children}</main>
    </div>
  );
}
