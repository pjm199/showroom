import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Use in img src: private Vercel Blob URLs must be served via /api/blob. */
export function blobDisplayUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.endsWith(".private.blob.vercel-storage.com"))
      return `/api/blob?url=${encodeURIComponent(url)}`
  } catch {
    /* invalid URL */
  }
  return url
}
