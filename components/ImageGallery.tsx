"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  title: string;
  tintFrom: string;
  tintTo: string;
  emoji: string;
  badge: string | null;
};

export default function ImageGallery({ images, title, tintFrom, tintTo, emoji, badge }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((index) => index === null ? null : (index + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => index === null ? null : (index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length]);

  return (
    <>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-paper-2 sm:aspect-square sm:rounded-2xl"
        style={{ backgroundImage: `linear-gradient(135deg, ${tintFrom}, ${tintTo})` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.65),transparent_58%)]" />
        {images.length > 0 ? (
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            aria-label={`Open ${title} photo`}
            className="absolute inset-0 block h-full w-full cursor-zoom-in"
          >
            <Image
              src={images[0]}
              alt={title}
              fill
              sizes="(max-width: 639px) 100vw, 50vw"
              quality={75}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-sm">
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" />
                <circle cx="12" cy="13" r="3.4" />
              </svg>
              View photos
            </span>
          </button>
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[112px] leading-none sm:text-[176px]">
            {emoji}
          </span>
        )}
        {badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-clay">
            {badge}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View photo ${index + 1} of ${images.length}`}
              className="overflow-hidden rounded-lg border border-line bg-paper-2 transition hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
            >
              <Image
                src={image}
                alt={`${title}, photo ${index + 1}`}
                width={128}
                height={128}
                sizes="(max-width: 639px) 20vw, 128px"
                quality={50}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 sm:p-10"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label="Close photo viewer"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
          >
            ×
          </button>
          {images.length > 1 ? (
            <button
              type="button"
              onClick={() => setActiveIndex((activeIndex! - 1 + images.length) % images.length)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20 sm:left-6"
            >
              ‹
            </button>
          ) : null}
          <figure className="flex max-h-full max-w-full flex-col items-center justify-center gap-3">
            <Image
              src={activeImage}
              alt={`${title}, photo ${(activeIndex ?? 0) + 1}`}
              width={1600}
              height={1200}
              sizes="92vw"
              quality={75}
              className="max-h-[82vh] max-w-[92vw] rounded object-contain"
            />
            <figcaption className="text-sm text-white/70">{title} · {(activeIndex ?? 0) + 1} of {images.length}</figcaption>
          </figure>
          {images.length > 1 ? (
            <button
              type="button"
              onClick={() => setActiveIndex(((activeIndex ?? 0) + 1) % images.length)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20 sm:right-6"
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
