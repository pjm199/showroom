import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma, ProductVisibility } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { blobDisplayUrl } from "@/lib/utils";
import { StorefrontProducts } from "./storefront-products";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!shop) return { title: "Shop not found" };
  return {
    title: `${shop.name} — Showroom`,
    description: shop.description ?? `Browse ${shop.name}'s showroom`,
  };
}

export default async function StorefrontPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token: tokenParam } = await searchParams;
  const token = tokenParam?.trim() || null;

  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      whatsapp: true,
      address: true,
      mapUrl: true,
      shareToken: true,
      shareTokenExpiresAt: true,
    },
  });

  if (!shop) notFound();

  const session = await auth();
  const isOwner =
    !!(
      session?.user &&
      (session.user as { shopId?: string }).shopId === shop.id
    );

  const hasValidShareLink =
    !!token &&
    shop.shareToken === token &&
    (!shop.shareTokenExpiresAt || shop.shareTokenExpiresAt > new Date());
  const visibilityFilter: Prisma.ProductWhereInput = hasValidShareLink
    ? { visibility: { in: [ProductVisibility.PUBLIC, ProductVisibility.PRIVATE_LINK] } }
    : { visibility: ProductVisibility.PUBLIC };

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { shopId: shop.id },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: { shopId: shop.id, ...visibilityFilter },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, name: true } },
      },
    }),
  ]);

  const shopImageSrc = blobDisplayUrl(shop.imageUrl) ?? shop.imageUrl;

  function formatPhoneForDisplay(phone: string): string {
    const d = phone.replace(/\D/g, "");
    if (d.length === 0) return phone;
    if (d.length >= 10) {
      return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
    }
    return d.replace(/(\d{3})(?=\d)/g, "$1 ");
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="relative border-b-2 border-amber-200/80 bg-gradient-to-b from-amber-50 to-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400" />
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-start gap-4 sm:gap-5">
            {shopImageSrc ? (
              <img
                src={shopImageSrc}
                alt=""
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[0.618rem] object-cover border-2 border-amber-200/90 shadow-sm shrink-0 ring-2 ring-amber-100/50"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[0.618rem] bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-3xl shrink-0 border border-amber-200/80 shadow-sm">
                {shop.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                {shop.name}
              </h1>
              {shop.description && (
                <p className="text-sm sm:text-base text-slate-600 mt-1 line-clamp-2">
                  {shop.description}
                </p>
              )}
              <p className="text-xs text-amber-700 mt-2 uppercase tracking-wide font-semibold">
                Reserve for pickup
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {shop.whatsapp && (
                  <a
                    href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 min-h-[2.618rem] pl-3 pr-4 rounded-[1.618rem] text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-colors"
                  >
                    <span className="flex items-center justify-center w-6 h-6 shrink-0" aria-hidden>
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatPhoneForDisplay(shop.whatsapp)}
                    </span>
                  </a>
                )}
                {shop.mapUrl && (
                  <a
                    href={shop.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center min-h-[2.618rem] px-4 rounded-[1.618rem] text-sm font-medium bg-amber-100/80 border border-amber-300/80 text-amber-900 hover:bg-amber-200/80 hover:border-amber-400 transition-colors"
                  >
                    Map
                  </a>
                )}
              </div>
              {shop.address && (
                <p className="text-sm text-slate-600 mt-3">
                  {shop.mapUrl ? (
                    <a
                      href={shop.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-800/90 hover:text-amber-900 underline underline-offset-2 decoration-amber-300 hover:decoration-amber-500 transition-colors"
                    >
                      {shop.address}
                    </a>
                  ) : (
                    shop.address
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">
        {/* Owner-only: hint and back to dashboard. Clients only see Back to Showroom. */}
        {isOwner && (
          <p className="text-xs text-slate-500 mb-2">
            You’re viewing your storefront as customers see it.
          </p>
        )}
        <Link
          href={isOwner ? "/dashboard/orders" : "/"}
          className="text-sm font-medium text-slate-600 hover:text-slate-800 mb-4 inline-block"
        >
          {isOwner ? "← Back to Dashboard" : "← Back to Showroom"}
        </Link>

        {products.length === 0 ? (
          <div className="rounded-[1.618rem] border-2 border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            <p className="font-medium">No products yet</p>
            <p className="text-sm mt-1">
              {shop.name} hasn’t published any products. Check back later.
            </p>
          </div>
        ) : (
          <StorefrontProducts
            slug={shop.slug}
            shopName={shop.name}
            products={products.map((p) => ({
              id: p.id,
              title: p.title,
              priceCents: p.priceCents,
              imageUrl: p.imageUrl,
              category: p.category,
            }))}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        )}
      </div>

      <footer className="border-t-2 border-amber-200/80 bg-gradient-to-b from-white to-amber-50/70 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800">{shop.name}</p>
              {shop.address && (
                <p className="text-sm text-slate-600 mt-0.5">{shop.address}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {shop.whatsapp && (
                <a
                  href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Contact via WhatsApp
                </a>
              )}
              {shop.mapUrl && (
                <a
                  href={shop.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
                >
                  Get directions
                </a>
              )}
            </div>
          </div>
          <p className="text-xs text-amber-800/70 mt-4 pt-4 border-t border-amber-200/60 text-center sm:text-left">
            Showroom — Reserve for pickup
          </p>
        </div>
      </footer>
    </main>
  );
}
