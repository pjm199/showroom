import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public API: get a single order by id (for confirmation page). Only returns order if it belongs to the shop identified by slug.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; orderId: string }> }
) {
  const { slug, orderId } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }
  const order = await prisma.order.findFirst({
    where: { id: orderId, shopId: shop.id },
    include: {
      items: {
        include: {
          product: { select: { title: true } },
        },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: order.id,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    pickupAt: order.pickupAt?.toISOString() ?? null,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      productId: i.productId,
      productTitle: i.product.title,
      quantity: i.quantity,
      priceCents: i.priceCents,
    })),
  });
}
