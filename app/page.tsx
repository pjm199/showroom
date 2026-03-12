import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { blobDisplayUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getLatestShops() {
  try {
    return await prisma.shop.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const session = await auth();
  if (session?.user && (session.user as { shopId?: string }).shopId) {
    redirect("/dashboard");
  }

  const latestShops = await getLatestShops();
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            Showroom
          </span>
          <nav className="flex gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-emerald-600"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg px-4 py-2"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Your shop,{" "}
            <span className="text-emerald-600">live online</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            The digital vetrina for local shops. Publish today’s products, prices,
            and take reservations in minutes — from your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold px-8 py-4 text-base hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/25"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold px-8 py-4 text-base hover:bg-slate-50 hover:border-emerald-200 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-20 sm:mt-28 w-full max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-semibold text-slate-800 mb-6">
            {latestShops.length > 0
              ? "Recently joined shops"
              : "Join other local shops"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {latestShops.length > 0 ? (
              latestShops.map((shop, i) => {
                const accents = [
                  { top: "border-t-4 border-t-emerald-500", bg: "bg-emerald-50", initial: "bg-emerald-100 text-emerald-700", link: "text-emerald-600 hover:text-emerald-700" },
                  { top: "border-t-4 border-t-amber-500", bg: "bg-amber-50", initial: "bg-amber-100 text-amber-700", link: "text-amber-600 hover:text-amber-700" },
                  { top: "border-t-4 border-t-sky-500", bg: "bg-sky-50", initial: "bg-sky-100 text-sky-700", link: "text-sky-600 hover:text-sky-700" },
                ];
                const accent = accents[i % 3];
                return (
                  <Link
                    key={shop.id}
                    href={`/s/${shop.slug}`}
                    className={`rounded-2xl border-2 border-slate-200 ${accent.top} ${accent.bg} p-6 text-center shadow-sm hover:shadow-md hover:border-slate-300 transition-all block`}
                  >
                    {shop.imageUrl ? (
                      <img
                        src={blobDisplayUrl(shop.imageUrl) ?? shop.imageUrl}
                        alt={`${shop.name} logo`}
                        className="w-20 h-20 rounded-xl object-cover mx-auto mb-4 ring-2 ring-white shadow-md"
                      />
                    ) : (
                      <div className={`w-20 h-20 rounded-xl ${accent.initial} flex items-center justify-center mx-auto mb-4 font-bold text-2xl`}>
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-800 mb-1">{shop.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {shop.description || "Explore their showroom"}
                    </p>
                    <span className={`inline-block mt-3 text-sm font-medium ${accent.link}`}>
                      View showroom →
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="sm:col-span-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center">
                <p className="text-slate-600">No shops yet. Be the first to join.</p>
                <Link
                  href="/register"
                  className="inline-block mt-4 text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
                >
                  Create your shop →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          Showroom — Live digital showroom for local shops
        </div>
      </footer>
    </main>
  );
}
