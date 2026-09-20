"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/storefront/product-gallery";

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

type Product = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  imageUrls: string[];
  category: { id: string; name: string } | null;
};

type Props = {
  slug: string;
  orderingEnabled: boolean;
  products: Product[];
  categories?: { id: string; name: string }[];
};

export function StorefrontProducts({
  slug,
  orderingEnabled,
  products,
  categories = [],
}: Props) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPickup, setFormPickup] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    if (!orderingEnabled) {
      setCart({});
      setShowForm(false);
    }
  }, [orderingEnabled]);

  const filteredProducts =
    categoryFilter === null
      ? products
      : products.filter((p) => p.category?.name === categoryFilter);
  const totalItems = (Object.values(cart) as number[]).reduce((a, q) => a + q, 0);

  function addToCart(productId: string) {
    setCart((prev: Record<string, number>) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  }

  function removeFromCart(productId: string) {
    setCart((prev: Record<string, number>) => {
      const next = { ...prev };
      const q = (next[productId] ?? 0) - 1;
      if (q <= 0) delete next[productId];
      else next[productId] = q;
      return next;
    });
  }

  async function handleSubmitReservation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = formName.trim();
    const phone = formPhone.trim();
    if (!name || !phone) {
      setError("Name and phone are required");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const entries = Object.entries(cart) as [string, number][];
      const items = entries
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity }));
      const body: {
        customerName: string;
        customerPhone: string;
        pickupAt?: string;
        notes?: string | null;
        items: { productId: string; quantity: number }[];
      } = {
        customerName: name,
        customerPhone: phone,
        items,
      };
      if (formPickup.trim()) {
        const d = new Date(formPickup.trim());
        if (!isNaN(d.getTime())) body.pickupAt = d.toISOString();
      }
      if (formNotes.trim()) body.notes = formNotes.trim();
      const res = await fetch(`/api/shops/slug/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const err =
          typeof data.error === "string"
            ? data.error
            : data.error?.customerName?.[0] ??
              data.error?.customerPhone?.[0] ??
              data.error?.items?.[0] ??
              "Could not place reservation";
        setError(err);
        return;
      }
      setCart({});
      setShowForm(false);
      router.push(`/s/${slug}/reserved?orderId=${data.id}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={`min-h-[2.618rem] px-4 rounded-[0.618rem] text-sm font-medium border-3 transition-colors ${
              categoryFilter === null
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-blue-100 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.name)}
              className={`min-h-[2.618rem] px-4 rounded-[0.618rem] text-sm font-medium border-2 transition-colors ${
                categoryFilter === c.name
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-blue-100 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      {filteredProducts.length === 0 ? (
        <p className="text-slate-500 text-center py-8 rounded-[1.618rem] border-2 border-dashed border-slate-200 bg-white">
          {categoryFilter ? "No products in this category." : "No products."}
        </p>
      ) : (
        <ul className="flex flex-col gap-[1.618rem]">
          {filteredProducts.map((p) => {
            const qty = cart[p.id] ?? 0;
            return (
              <li
                key={p.id}
                className="rounded-[0.618rem] border-2 border-slate-200 bg-white shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col sm:flex-row sm:items-stretch"
              >
                <div className="w-full sm:w-[min(58%,24rem)] sm:flex-shrink-0 sm:max-w-[48%] border-b sm:border-b-0 sm:border-r border-amber-100/50 bg-white">
                  <div className="p-0 sm:p-2">
                    <ProductGallery
                      imageUrls={p.imageUrls}
                      productTitle={p.title}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0 p-4 sm:p-[1.618rem] flex flex-col justify-between gap-3">
                  <div className="space-y-2 min-h-0">
                    {p.category?.name && (
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {p.category.name}
                      </p>
                    )}
                    <p className="font-semibold text-slate-800 text-lg sm:text-xl leading-snug">
                      {p.title}
                    </p>
                    {p.description ? (
                      <p className="text-sm sm:text-[0.95rem] text-slate-600 leading-relaxed line-clamp-5">
                        {p.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-3 pt-2 border-t border-slate-100">
                    <p className="text-lg sm:text-xl font-semibold text-emerald-600 tabular-nums">
                      {formatPrice(p.priceCents)}
                    </p>
                    {orderingEnabled ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFromCart(p.id)}
                          disabled={qty === 0}
                          className="w-10 h-10 rounded-[0.618rem] border-2 border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium text-xl leading-none"
                          aria-label="Remove one"
                        >
                          −
                        </button>
                        <span className="text-base font-medium w-7 text-center tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(p.id)}
                          className="w-10 h-10 rounded-[0.618rem] border-2 border-emerald-500 bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 font-medium text-xl leading-none"
                          aria-label="Add one"
                        >
                          +
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {orderingEnabled && totalItems > 0 && (
        <div className="sticky bottom-0 left-0 right-0 mt-6 p-5 bg-white border-t-2 border-slate-200 shadow-lg rounded-t-[1.618rem]">
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full min-h-[3.236rem] rounded-[1.618rem] text-base font-semibold bg-emerald-600 hover:bg-emerald-500"
            >
              Reserve ({totalItems} {totalItems === 1 ? "item" : "items"})
            </Button>
          ) : (
            <form onSubmit={handleSubmitReservation} className="space-y-5">
              <h3 className="font-semibold text-slate-800">Your details</h3>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-[0.618rem]">
                  {error}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) =>
                    setFormName((e.target as HTMLInputElement).value)
                  }
                  required
                  maxLength={200}
                  className="w-full min-h-[3rem] rounded-[1.618rem] border-2 border-slate-200 px-5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) =>
                    setFormPhone((e.target as HTMLInputElement).value)
                  }
                  required
                  maxLength={50}
                  className="w-full min-h-[3rem] rounded-[1.618rem] border-2 border-slate-200 px-5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pickup date & time (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formPickup}
                  onChange={(e) =>
                    setFormPickup((e.target as HTMLInputElement).value)
                  }
                  className="w-full min-h-[3rem] rounded-[1.618rem] border-2 border-slate-200 px-5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) =>
                    setFormNotes((e.target as HTMLTextAreaElement).value)
                  }
                  maxLength={500}
                  rows={2}
                  className="w-full rounded-[1.618rem] border-2 border-slate-200 px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 resize-none"
                  placeholder="Allergies, special requests..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 min-h-[3rem] rounded-[1.618rem] border-2 border-slate-200"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-h-[3rem] rounded-[1.618rem] bg-emerald-600 hover:bg-emerald-500"
                >
                  {submitting ? "Sending…" : "Confirm reservation"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="h-4" />
    </>
  );
}
