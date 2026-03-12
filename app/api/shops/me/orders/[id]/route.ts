import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateOrderStatusSchema } from "@/lib/validations/order";

async function getShopId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return (session.user as { shopId?: string }).shopId ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { body: ["Invalid JSON"] } },
      { status: 400 }
    );
  }
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const order = await prisma.order.findFirst({
    where: { id, shopId },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Enforce flow: cannot Complete before Accept
  if (
    parsed.data.status === "COMPLETED" &&
    order.status === "PENDING"
  ) {
    return NextResponse.json(
      { error: "Accept the order first, then mark as Complete." },
      { status: 400 }
    );
  }
  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
    });
    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      customerName: updated.customerName,
      customerPhone: updated.customerPhone,
      pickupAt: updated.pickupAt?.toISOString() ?? null,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
      items: updated.items.map((i) => ({
        productId: i.productId,
        productTitle: i.product.title,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
