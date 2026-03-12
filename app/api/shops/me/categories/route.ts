import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCategorySchema } from "@/lib/validations/category";

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
    const categories = await prisma.category.findMany({
      where: { shopId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        sortOrder: true,
        createdAt: true,
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder,
        createdAt: c.createdAt,
        productCount: c._count.products,
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load categories" },
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
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, sortOrder } = parsed.data;
    const category = await prisma.category.create({
      data: {
        shopId,
        name: name.trim(),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    return NextResponse.json({
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
