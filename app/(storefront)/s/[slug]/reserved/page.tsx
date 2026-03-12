import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export default async function ReservedPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!shop) notFound();

  const session = await auth();
  const isOwner =
    !!(
      session?.user &&
      (session.user as { shopId?: string }).shopId === shop.id
    );

  let order: {
    id: string;
    status: string;
    customerName: string;
    pickupAt: string | null;
    items: { productTitle: string; quantity: number; priceCents: number }[];
  } | null = null;

  if (orderId) {
    const shopForOrder = await prisma.shop.findUnique({
      where: { slug },
      select: { id: true },
    });
    const o =
      shopForOrder &&
      (await prisma.order.findFirst({
        where: { id: orderId, shopId: shopForOrder.id },
        include: {
          items: {
            include: {
              product: { select: { title: true } },
            },
          },
        },
      }));
    if (o) {
      order = {
        id: o.id,
        status: o.status,
        customerName: o.customerName,
        pickupAt: o.pickupAt?.toISOString() ?? null,
        items: o.items.map((i) => ({
          productTitle: i.product.title,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
      };
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <div className="max-w-lg mx-auto w-full px-4 py-12 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mb-6">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Reservation received
        </h1>
        <p className="text-slate-600 mb-8">
          Thank you! {shop.name} will confirm your order and get in touch at the
          number you provided.
        </p>
        {order && (
          <div className="w-full rounded-[1.618rem] border-2 border-slate-200 bg-white p-5 text-left mb-8">
            <p className="text-xs text-slate-500 mb-2">Order #{order.id.slice(-6)}</p>
            <ul className="space-y-1 text-sm text-slate-700">
              {order.items.map((i, idx) => (
                <li key={idx}>
                  {i.quantity}× {i.productTitle} — {formatPrice(i.priceCents * i.quantity)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href={isOwner ? "/dashboard/orders" : `/s/${slug}`}
          className="text-emerald-600 font-semibold hover:text-emerald-700"
        >
          {isOwner ? "← Back to Dashboard" : `← Back to ${shop.name}`}
        </Link>
      </div>
    </main>
  );
}
