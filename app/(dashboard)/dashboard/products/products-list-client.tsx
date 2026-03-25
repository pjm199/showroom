"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { blobDisplayUrl } from "@/lib/utils";

type Product = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  categoryName: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  visibility: string;
  createdAt: string;
};

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export function ProductsListClient() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchProducts() {
    setError("");
    try {
      const res = await fetch("/api/shops/me/products");
      if (!res.ok) {
        setError("Could not load products");
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/shops/me/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not delete");
        return;
      }
      await fetchProducts();
      router.refresh();
    } catch {
      setError("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[120px] flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">
          {error}
        </div>
      )}

      <Link
        href="/dashboard/products/new"
        className="flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 w-full"
      >
        📷 Add product
      </Link>

      <ul className="space-y-3">
        {products.length === 0 ? (
          <li className="text-slate-500 py-10 text-center rounded-xl border-2 border-dashed border-slate-200">
            No products yet. Tap &quot;Add product&quot; to create one.
          </li>
        ) : (
          products.map((p) => {
            const imgs =
              p.imageUrls?.length > 0
                ? p.imageUrls
                : p.imageUrl
                  ? [p.imageUrl]
                  : [];
            const cover = imgs[0];
            return (
            <li
              key={p.id}
              className="flex gap-4 rounded-xl border-2 border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-[5.25rem]">
                <div className="w-[5.25rem] h-[5.25rem] rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                  {cover ? (
                    <img
                      src={blobDisplayUrl(cover) ?? cover}
                      alt=""
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  ) : (
                    <span className="text-2xl text-slate-400" aria-hidden>
                      📦
                    </span>
                  )}
                </div>
                {imgs.length > 1 && (
                  <div className="flex gap-1 justify-center flex-wrap max-w-full">
                    {imgs.slice(0, 5).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          i === 0 ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                        aria-hidden
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{p.title}</p>
                <p className="text-sm text-slate-600">{formatPrice(p.priceCents)}</p>
                {p.categoryName && (
                  <p className="text-xs text-slate-500">{p.categoryName}</p>
                )}
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded ${
                    p.visibility === "PUBLIC"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {p.visibility}
                </span>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href={`/dashboard/products/${p.id}/edit`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border-2 border-slate-200 hover:bg-slate-50"
                  aria-label="Edit"
                >
                  ✏️
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px] min-w-[44px] p-0 text-red-600 border-red-200 hover:bg-red-50"
                  disabled={deletingId === p.id}
                  onClick={() => handleDelete(p.id)}
                  aria-label="Delete"
                >
                  {deletingId === p.id ? "…" : "🗑️"}
                </Button>
              </div>
            </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
