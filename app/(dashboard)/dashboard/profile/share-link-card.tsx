"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ShareLinkCard() {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function fetchShareLink() {
    setError("");
    try {
      const res = await fetch("/api/shops/me/share-link");
      if (!res.ok) {
        setError("Could not load share link");
        return;
      }
      const data = await res.json();
      setShareUrl(data.shareUrl ?? null);
      setExpiresAt(data.expiresAt ?? null);
    } catch {
      setError("Could not load share link");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchShareLink();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/shops/me/share-link", { method: "POST" });
      if (!res.ok) {
        setError("Could not generate link");
        return;
      }
      const data = await res.json();
      setShareUrl(data.shareUrl);
      setExpiresAt(data.expiresAt ?? null);
    } catch {
      setError("Could not generate link");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-2">
          Private storefront link
        </h2>
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-5 space-y-4">
      <h2 className="text-base font-semibold text-slate-800">
        Private storefront link
      </h2>
      <p className="text-sm text-slate-600">
        Share this link with clients so they can see products of the day
        (including those set to &quot;Private link&quot;) and place orders.
        The link is valid for 7 days; generate a new one anytime.
      </p>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}
      {shareUrl ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 min-h-[44px] rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 truncate"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="rounded-xl min-h-[44px] px-4 border-2 border-slate-200 shrink-0"
            >
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
          {expiresAt && (
            <p className="text-xs text-slate-500">
              Expires: {new Date(expiresAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl border-2 border-slate-200"
          >
            {generating ? "Generating…" : "Regenerate link"}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 min-h-[44px]"
        >
          {generating ? "Generating…" : "Generate share link"}
        </Button>
      )}
    </div>
  );
}
