"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { blobDisplayUrl } from "@/lib/utils";

type Category = { id: string; name: string };

type ProductFormInitial = {
  title: string;
  description: string;
  priceCents: number;
  categoryId: string;
  imageUrl: string;
  visibility: "DRAFT" | "PRIVATE_LINK" | "PUBLIC";
};

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
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [visibility, setVisibility] = useState<"DRAFT" | "PRIVATE_LINK" | "PUBLIC">(
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
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
      if (data.url) setImageUrl(data.url);
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
        imageUrl: imageUrl || null,
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
        <label className={labelClass}>Photo</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Upload product photo"
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploadingImage}
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[48px] rounded-xl text-base font-medium border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
        >
          {uploadingImage ? "Uploading…" : "📷 Take photo or choose image"}
        </Button>
        {imageUrl && (
          <Image
            src={blobDisplayUrl(imageUrl) ?? imageUrl}
            alt=""
            width={96}
            height={96}
            className="mt-3 w-24 h-24 rounded-xl object-cover border-2 border-slate-200"
          />
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
