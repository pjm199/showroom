"use client";

import { useState, useRef, useCallback } from "react";
import { blobDisplayUrl } from "@/lib/utils";

type Props = {
  imageUrls: string[];
  productTitle: string;
};

export function ProductGallery({ imageUrls, productTitle }: Props) {
  const urls = imageUrls.filter(Boolean);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const safeIndex = urls.length ? Math.min(index, urls.length - 1) : 0;
  const current = urls[safeIndex];
  const src = current ? (blobDisplayUrl(current) ?? current) : null;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (urls.length <= 1) return;
      setIndex((i) => (i + dir + urls.length) % urls.length);
    },
    [urls.length]
  );

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || urls.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    go(dx < 0 ? 1 : -1);
  }

  if (!src) {
    return (
      <div className="aspect-golden w-full rounded-[0.618rem] bg-slate-100 flex items-center justify-center text-4xl text-slate-400 border border-slate-200/80">
        📦
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3 w-full">
      <div
        className="relative aspect-golden w-full rounded-[0.618rem] bg-slate-100 border border-slate-200/80 overflow-hidden touch-pan-y select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
          <img
            src={src}
            alt={productTitle}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            draggable={false}
            loading={safeIndex === 0 ? "eager" : "lazy"}
          />
        </div>
        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-slate-200/90 shadow-md text-slate-700 hover:bg-white text-xl font-medium hidden sm:flex items-center justify-center"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-slate-200/90 shadow-md text-slate-700 hover:bg-white text-xl font-medium hidden sm:flex items-center justify-center"
              aria-label="Next image"
            >
              ›
            </button>
            <div
              className="sm:hidden absolute bottom-0 inset-x-0 py-1.5 px-2 text-center text-[11px] text-slate-600 bg-gradient-to-t from-white/95 to-transparent"
              aria-hidden
            >
              Scorri a sinistra/destra · {safeIndex + 1}/{urls.length}
            </div>
          </>
        )}
      </div>

      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 -mx-0.5 px-0.5 snap-x snap-mandatory">
          {urls.map((url, i) => {
            const thumbSrc = blobDisplayUrl(url) ?? url;
            const active = i === safeIndex;
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={`relative shrink-0 w-[3.75rem] h-[3.75rem] sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 snap-start transition-all bg-slate-100 ${
                  active
                    ? "border-emerald-500 ring-2 ring-emerald-200/80 scale-[1.02]"
                    : "border-slate-200 opacity-85 hover:opacity-100"
                }`}
                aria-label={`Immagine ${i + 1} di ${urls.length}`}
                aria-current={active ? "true" : undefined}
              >
                <img
                  src={thumbSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
