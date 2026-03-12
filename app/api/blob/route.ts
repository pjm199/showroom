import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

const PRIVATE_BLOB_HOST = ".private.blob.vercel-storage.com";

export async function GET(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(PRIVATE_BLOB_HOST)) {
      return NextResponse.json({ error: "Invalid blob URL" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const result = await get(url, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result || !result.stream) {
      return NextResponse.json({ error: "Blob not found" }, { status: 404 });
    }

    const contentType =
      result.blob.contentType || "application/octet-stream";

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": result.blob.cacheControl || "public, max-age=31536000",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load blob" }, { status: 500 });
  }
}
