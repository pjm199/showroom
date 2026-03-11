import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name, shopName, shopSlug } = parsed.data;
    const slug = shopSlug || slugify(shopName);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: { email: ["Email already registered"] } },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.shop.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: { shopSlug: ["This URL slug is already taken"] } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const shop = await prisma.shop.create({
      data: {
        name: shopName,
        slug,
      },
    });
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        shopId: shop.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
