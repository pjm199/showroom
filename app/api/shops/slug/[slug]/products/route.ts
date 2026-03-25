import { NextResponse } from "next/server";
import { Prisma, ProductVisibility } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeProductImageUrls } from "@/lib/product-images";

/**
 * Public API: list products for a shop by slug.
 * Without ?token=... only PUBLIC products. With valid ?token=... returns PUBLIC + PRIVATE_LINK (share link).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim() || null;

  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { id: true, shareToken: true, shareTokenExpiresAt: true },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  const hasValidShareLink =
    !!token &&
    shop.shareToken === token &&
    (!shop.shareTokenExpiresAt || shop.shareTokenExpiresAt > new Date());

  const visibilityFilter: Prisma.ProductWhereInput = hasValidShareLink
    ? { visibility: { in: [ProductVisibility.PUBLIC, ProductVisibility.PRIVATE_LINK] } }
    : { visibility: ProductVisibility.PUBLIC };

  try {
    const products = await prisma.product.findMany({
      where: {
        shopId: shop.id,
        ...visibilityFilter,
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
