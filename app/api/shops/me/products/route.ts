import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createProductSchema } from "@/lib/validations/product";

async function getShopId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return (session.user as { shopId?: string }).shopId ?? null;
}

export async function GET() {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const products = await prisma.product.findMany({
      where: { shopId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        categoryId: p.categoryId,
        categoryName: p.category?.name ?? null,
        imageUrl: p.imageUrl,
        visibility: p.visibility,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt,
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    if (data.categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: data.categoryId, shopId },
      });
      if (!cat) {
        return NextResponse.json(
          { error: { categoryId: ["Category not found or not yours"] } },
          { status: 400 }
        );
      }
    }
    const product = await prisma.product.create({
      data: {
        shopId,
        title: data.title.trim(),
        description: data.description?.trim() ?? null,
        priceCents: data.priceCents,
        categoryId: data.categoryId ?? null,
        imageUrl: data.imageUrl ?? null,
        visibility: data.visibility,
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({
      id: product.id,
      title: product.title,
      description: product.description,
      priceCents: product.priceCents,
      categoryId: product.categoryId,
      categoryName: product.category?.name ?? null,
      imageUrl: product.imageUrl,
      visibility: product.visibility,
      sortOrder: product.sortOrder,
      createdAt: product.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
