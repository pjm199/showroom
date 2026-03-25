import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dedupeCap } from "@/lib/product-images";
import { updateProductSchema } from "@/lib/validations/product";

async function getShopId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return (session.user as { shopId?: string }).shopId ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, shopId },
    include: {
      category: { select: { id: true, name: true } },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const imageUrls = dedupeCap(
    product.imageUrls?.length
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [],
    5
  );
  return NextResponse.json({
    id: product.id,
    title: product.title,
    description: product.description,
    priceCents: product.priceCents,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    imageUrl: imageUrls[0] ?? product.imageUrl,
    imageUrls,
    visibility: product.visibility,
    sortOrder: product.sortOrder,
    createdAt: product.createdAt,
  });
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
  const existing = await prisma.product.findFirst({
    where: { id, shopId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  try {
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    let imagePatch: { imageUrls: string[]; imageUrl: string | null } | undefined;
    if (data.imageUrls !== undefined) {
      const urls = dedupeCap(data.imageUrls, 5);
      imagePatch = { imageUrls: urls, imageUrl: urls[0] ?? null };
    } else if (data.imageUrl !== undefined) {
      const urls = data.imageUrl ? dedupeCap([data.imageUrl], 5) : [];
      imagePatch = { imageUrls: urls, imageUrl: data.imageUrl };
    }
    if (data.categoryId !== undefined && data.categoryId !== null) {
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
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() ?? null }),
        ...(data.priceCents !== undefined && { priceCents: data.priceCents }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(imagePatch && {
          imageUrls: imagePatch.imageUrls,
          imageUrl: imagePatch.imageUrl,
        }),
        ...(data.visibility !== undefined && { visibility: data.visibility }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    const outUrls = dedupeCap(
      product.imageUrls?.length
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : [],
      5
    );
    return NextResponse.json({
      id: product.id,
      title: product.title,
      description: product.description,
      priceCents: product.priceCents,
      categoryId: product.categoryId,
      categoryName: product.category?.name ?? null,
      imageUrl: outUrls[0] ?? product.imageUrl,
      imageUrls: outUrls,
      visibility: product.visibility,
      sortOrder: product.sortOrder,
      createdAt: product.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.product.findFirst({
    where: { id, shopId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
