import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateShopSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  mapUrl: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const shopId = (session.user as { shopId?: string }).shopId;
  if (!shopId) {
    return NextResponse.json({ error: "No shop linked" }, { status: 403 });
  }
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    description: shop.description,
    imageUrl: shop.imageUrl,
    whatsapp: shop.whatsapp,
    address: shop.address,
    mapUrl: shop.mapUrl,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const shopId = (session.user as { shopId?: string }).shopId;
  if (!shopId) {
    return NextResponse.json({ error: "No shop linked" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const parsed = updateShopSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    if (data.slug) {
      const existing = await prisma.shop.findFirst({
        where: { slug: data.slug, id: { not: shopId } },
      });
      if (existing) {
        return NextResponse.json(
          { error: { slug: ["This URL slug is already taken"] } },
          { status: 400 }
        );
      }
    }
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.slug != null && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.mapUrl !== undefined && { mapUrl: data.mapUrl }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });
    return NextResponse.json({
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      imageUrl: shop.imageUrl,
      whatsapp: shop.whatsapp,
      address: shop.address,
      mapUrl: shop.mapUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
