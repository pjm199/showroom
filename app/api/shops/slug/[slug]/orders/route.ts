import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations/order";

/**
 * Public API: create a reservation/order for a shop (by slug).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { body: ["Invalid JSON"] } },
      { status: 400 }
    );
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Resolve products: must belong to this shop and be PUBLIC or PRIVATE_LINK (share link)
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      shopId: shop.id,
      visibility: { in: ["PUBLIC", "PRIVATE_LINK"] },
    },
    select: { id: true, priceCents: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const missing = productIds.filter((id) => !productMap.has(id));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: { items: ["Some products are invalid or not available"] } },
      { status: 400 }
    );
  }

  const pickupAt = data.pickupAt ? new Date(data.pickupAt) : null;
  if (data.pickupAt && (isNaN(pickupAt!.getTime()) || pickupAt! < new Date())) {
    return NextResponse.json(
      { error: { pickupAt: ["Pickup time must be in the future"] } },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.create({
      data: {
        shopId: shop.id,
        customerName: data.customerName.trim(),
        customerPhone: data.customerPhone.trim(),
        pickupAt,
        notes: data.notes?.trim() || null,
        status: "PENDING",
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceCents: productMap.get(item.productId)!.priceCents,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
    });
    return NextResponse.json({
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      pickupAt: order.pickupAt?.toISOString() ?? null,
      notes: order.notes,
      items: order.items.map((i) => ({
        productId: i.productId,
        productTitle: i.product.title,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
