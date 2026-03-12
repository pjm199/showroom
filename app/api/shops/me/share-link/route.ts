import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "node:crypto";

async function getShopId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return (session.user as { shopId?: string }).shopId ?? null;
}

function randomToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/** GET: return current share link if any */
export async function GET(request: Request) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { slug: true, shareToken: true, shareTokenExpiresAt: true },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }
  if (!shop.shareToken) {
    return NextResponse.json({ shareUrl: null, expiresAt: null });
  }
  const origin = new URL(request.url).origin;
  const shareUrl = `${origin}/s/${shop.slug}?token=${shop.shareToken}`;
  return NextResponse.json({
    shareUrl,
    expiresAt: shop.shareTokenExpiresAt?.toISOString() ?? null,
  });
}

/** POST: generate or regenerate share link (valid 7 days by default) */
export async function POST(request: Request) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }
  const token = randomToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  await prisma.shop.update({
    where: { id: shopId },
    data: { shareToken: token, shareTokenExpiresAt: expiresAt },
  });
  const origin = new URL(request.url).origin;
  const shareUrl = `${origin}/s/${shop.slug}?token=${token}`;
  return NextResponse.json({
    shareUrl,
    expiresAt: expiresAt.toISOString(),
  });
}
