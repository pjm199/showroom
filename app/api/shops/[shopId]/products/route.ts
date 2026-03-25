import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeProductImageUrls } from "@/lib/product-images";

/**
 * Public API: list products for a shop (storefront).
 * Returns only PUBLIC products. PRIVATE_LINK + token in Phase 5.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const { shopId } = await params;
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }
  try {
    const products = await prisma.product.findMany({
      where: {
        shopId,
        visibility: "PUBLIC",
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(
      products.map((p) => {
        const imageUrls = normalizeProductImageUrls(p);
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          priceCents: p.priceCents,
          categoryId: p.categoryId,
          categoryName: p.category?.name ?? null,
          imageUrl: imageUrls[0] ?? p.imageUrl,
          imageUrls,
          sortOrder: p.sortOrder,
        };
      })
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
