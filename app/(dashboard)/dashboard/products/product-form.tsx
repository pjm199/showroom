"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { blobDisplayUrl } from "@/lib/utils";

type Category = { id: string; name: string };

type ProductFormInitial = {
  title: string;
  description: string;
  priceCents: number;
  categoryId: string;
  imageUrls: string[];
  visibility: "DRAFT" | "PRIVATE_LINK" | "PUBLIC";
};

const MAX_IMAGES = 5;

const inputClass =
  "w-full min-h-[48px] rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:border-emerald-400";
const labelClass = "block text-sm font-medium text-slate-700 mb-2";

type Props = {
  productId?: string;
  initial?: ProductFormInitial;
};

export function ProductForm({ productId, initial }: Props) {
  const router = useRouter();
  const isEdit = !!productId && !!initial;
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceEur, setPriceEur] = useState(
    initial ? (initial.priceCents / 100).toFixed(2) : ""
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(
    initial?.imageUrls?.length ? initial.imageUrls.slice(0, MAX_IMAGES) : []
  );
  const [visibility, setVisibility] = useState<
    "DRAFT" | "PRIVATE_LINK" | "PUBLIC"
  >(
    initial?.visibility === "PUBLIC"
      ? "PUBLIC"
      : initial?.visibility === "PRIVATE_LINK"
        ? "PRIVATE_LINK"
        : "DRAFT"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/shops/me/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  function toErrorString(err: unknown): string {
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && !Array.isArray(err)) {
      const values = Object.values(err).flat();
      const first = values.find((v) => typeof v === "string");
      if (first) return first;
    }
    return "Something went wrong";
  }

  function removeImageAt(i: number) {
    setImageUrls((prev) => prev.filter((_, j) => j !== i));
  }

  function moveImage(from: number, dir: -1 | 1) {
    setImageUrls((prev) => {
      const to = from + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (imageUrls.length >= MAX_IMAGES) {
      setError(`Massimo ${MAX_IMAGES} foto per prodotto`);
      return;
    }
    setUploadingImage(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "products");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(toErrorString(data.error) || "Upload failed");
        return;
      }
      if (data.url) {
        setImageUrls((prev) =>
          prev.length >= MAX_IMAGES ? prev : [...prev, data.url as string]
        );
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const titleTrim = title.trim();
    if (!titleTrim) {
      setError("Title required");
      return;
    }
    const num = parseFloat(priceEur.replace(",", "."));
    if (Number.isNaN(num) || num < 0) {
      setError("Enter a valid price (e.g. 12,50)");
      return;
    }
    const priceCents = Math.round(num * 100);
    setError("");
    setLoading(true);
    try {
      const body = {
        title: titleTrim,
        description: description.trim() || null,
        priceCents,
        categoryId: categoryId || null,
        imageUrls: imageUrls.slice(0, MAX_IMAGES),
        visibility,
      };
      const url = isEdit
        ? `/api/shops/me/products/${productId}`
        : "/api/shops/me/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(toErrorString(data.error));
        return;
      }
      router.push("/dashboard/products");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>
          Foto (max {MAX_IMAGES}) — prima immagine = copertina
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Carica foto prodotto"
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploadingImage || imageUrls.length >= MAX_IMAGES}
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[48px] rounded-xl text-base font-medium border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
        >
          {uploadingImage
            ? "Caricamento…"
            : imageUrls.length >= MAX_IMAGES
              ? `Hai già ${MAX_IMAGES} foto`
              : `📷 Aggiungi foto (${imageUrls.length}/${MAX_IMAGES})`}
        </Button>
        {imageUrls.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imageUrls.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="relative rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden aspect-square flex items-center justify-center p-2"
              >
                <img
                  src={blobDisplayUrl(url) ?? url}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => removeImageAt(i)}
                    className="w-8 h-8 rounded-lg bg-white/95 border border-slate-200 text-sm font-medium text-red-600 shadow-sm"
                    aria-label="Rimuovi foto"
                  >
                    ×
                  </button>
                </div>
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 justify-center">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveImage(i, -1)}
                    className="flex-1 min-h-8 rounded-md bg-white/95 border border-slate-200 text-xs font-medium disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={i === imageUrls.length - 1}
                    onClick={() => moveImage(i, 1)}
                    className="flex-1 min-h-8 rounded-md bg-white/95 border border-slate-200 text-xs font-medium disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                    Copertina
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="e.g. Fresh sea bream"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="priceEur" className={labelClass}>
          Price (€) *
        </label>
        <input
          id="priceEur"
          type="text"
          inputMode="decimal"
          value={priceEur}
          onChange={(e) => setPriceEur(e.target.value)}
          placeholder="12,50"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Short description"
          className={inputClass + " min-h-[80px] resize-y py-3"}
        />
      </div>

      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Category
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClass}
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelClass}>Visibility</span>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={() => setVisibility("DRAFT")}
            className={`flex-1 min-h-[48px] rounded-xl border-2 font-medium min-w-[80px] ${
              visibility === "DRAFT"
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => setVisibility("PRIVATE_LINK")}
            className={`flex-1 min-h-[48px] rounded-xl border-2 font-medium min-w-[80px] ${
              visibility === "PRIVATE_LINK"
                ? "border-amber-600 bg-amber-600 text-white"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            Private link
          </button>
          <button
            type="button"
            onClick={() => setVisibility("PUBLIC")}
            className={`flex-1 min-h-[48px] rounded-xl border-2 font-medium min-w-[80px] ${
              visibility === "PUBLIC"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            Public
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Draft = only you. Private link = visible only via your share link (Profile). Public = visible to everyone.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/products"
          className="flex-1 min-h-[52px] flex items-center justify-center rounded-xl border-2 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          disabled={loading || uploadingImage}
          className="flex-1 min-h-[52px] rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500"
        >
          {loading ? "Saving…" : uploadingImage ? "Uploading photo…" : isEdit ? "Save" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
