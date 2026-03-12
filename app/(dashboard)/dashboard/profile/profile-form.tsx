"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { blobDisplayUrl } from "@/lib/utils";

type Initial = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  whatsapp: string;
  address: string;
  mapUrl: string;
};

const inputClass =
  "w-full min-h-[48px] rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:border-emerald-400";
const labelClass = "block text-sm font-medium text-slate-700 mb-2";

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [address, setAddress] = useState(initial.address);
  const [mapUrl, setMapUrl] = useState(initial.mapUrl);
  const [error, setError] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError({});
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/shops/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || null,
          imageUrl: imageUrl?.trim() || null,
          whatsapp: whatsapp || null,
          address: address || null,
          mapUrl: mapUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? { _: ["Update failed"] });
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError({ _: ["Something went wrong"] });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setUploadError("");
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "logos");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }
      if (data.url) setImageUrl(data.url);
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  }

  const flatError = Object.values(error).flat();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {flatError.length > 0 && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200 space-y-1">
          {flatError.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
      {saved && (
        <p className="text-sm text-green-600 bg-green-500/10 rounded-lg p-3">
          Profile saved.
        </p>
      )}
      <div>
        <label htmlFor="name" className={labelClass}>
          Shop name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="slug" className={labelClass}>
          Storefront URL slug
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          pattern="[a-z0-9-]+"
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Your storefront will be at /s/{slug || "…"}
        </p>
        {error.slug?.map((m, i) => (
          <p key={i} className="text-xs text-red-600 mt-1">
            {m}
          </p>
        ))}
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass + " min-h-[100px] resize-y py-3"}
        />
      </div>
      <div>
        <label className={labelClass}>Shop logo</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleLogoUpload}
              className="hidden"
              aria-label="Upload logo"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploadingLogo}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[48px] px-6 rounded-xl text-base font-medium border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
            >
              {uploadingLogo ? "Uploading…" : "📷 Take photo or choose image"}
            </Button>
            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
          </div>
          {imageUrl && (
            <div className="flex items-center gap-3">
              <img
                src={blobDisplayUrl(imageUrl) ?? imageUrl}
                alt="Logo"
                className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-sm text-slate-500">Preview</span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Use camera or gallery. Or paste a URL below.
        </p>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://… or upload above"
          className={inputClass + " mt-2"}
        />
      </div>
      <div>
        <label htmlFor="whatsapp" className={labelClass}>
          WhatsApp number (optional)
        </label>
        <input
          id="whatsapp"
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+39 123 456 7890"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="address" className={labelClass}>
          Address (optional)
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="mapUrl" className={labelClass}>
          Google Maps link (optional)
        </label>
        <input
          id="mapUrl"
          type="url"
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          placeholder="https://maps.google.com/..."
          className={inputClass}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full min-h-[52px] rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500"
      >
        {loading ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
