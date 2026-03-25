/** Normalize stored product images: prefer `imageUrls`, fall back to legacy `imageUrl`. */
export function normalizeProductImageUrls(p: {
  imageUrls: string[];
  imageUrl: string | null;
}): string[] {
  const raw = p.imageUrls?.filter((u) => typeof u === "string" && u.trim()) ?? [];
  if (raw.length > 0) return dedupeCap(raw, 5);
  if (p.imageUrl?.trim()) return [p.imageUrl.trim()];
  return [];
}

export function dedupeCap(urls: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const t = u.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}
