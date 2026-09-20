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

  const frameClass =
    "relative w-full overflow-hidden rounded-[0.618rem] bg-gradient-to-b from-white via-amber-50/25 to-amber-50/50 ring-1 ring-amber-100/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] aspect-golden min-h-[11.5rem] sm:min-h-0";

  if (!src) {
    return (
      <div
        className={`${frameClass} flex items-center justify-center`}
        aria-hidden
      >
        <span className="text-[2.75rem] leading-none opacity-[0.22] grayscale">
          📦
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full">
      <div
        className={`${frameClass} touch-pan-y select-none`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={src}
          alt={productTitle}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
          loading={safeIndex === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={safeIndex === 0 ? "high" : "auto"}
        />
        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-amber-200/80 shadow-md text-slate-700 hover:bg-white text-xl font-medium hidden sm:flex items-center justify-center"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-amber-200/80 shadow-md text-slate-700 hover:bg-white text-xl font-medium hidden sm:flex items-center justify-center"
              aria-label="Next image"
            >
              ›
            </button>
            <div
              className="sm:hidden absolute bottom-0 inset-x-0 py-1.5 px-2 text-center text-[11px] font-medium text-amber-900/80 bg-gradient-to-t from-white/95 via-white/85 to-transparent"
              aria-hidden
            >
              Scorri · {safeIndex + 1}/{urls.length}
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
                className={`relative shrink-0 w-[3.75rem] h-[3.75rem] sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 snap-start transition-all bg-white ring-offset-1 ${
                  active
                    ? "border-emerald-500 ring-2 ring-emerald-300/70 scale-[1.02]"
                    : "border-amber-100/80 opacity-90 hover:opacity-100 hover:border-amber-200"
                }`}
                aria-label={`Immagine ${i + 1} di ${urls.length}`}
                aria-current={active ? "true" : undefined}
              >
                <img
                  src={thumbSrc}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
