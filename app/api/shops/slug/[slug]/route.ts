import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public API: shop profile by slug (for storefront /s/[slug]).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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
    },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }
  return NextResponse.json(shop);
}
