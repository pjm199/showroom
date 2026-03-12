import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getShopId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return (session.user as { shopId?: string }).shopId ?? null;
}

export async function GET(request: Request) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // PENDING | ACCEPTED | COMPLETED | CANCELLED
  const statusFilter =
    status && ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"].includes(status)
      ? { status: status as "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED" }
      : {};
  try {
    const orders = await prisma.order.findMany({
      where: { shopId, ...statusFilter },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
    });
    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        pickupAt: o.pickupAt?.toISOString() ?? null,
        status: o.status,
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          productId: i.productId,
          productTitle: i.product.title,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
