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
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-black/5 sm:aspect-square sm:rounded-3xl" style={{ backgroundImage: `linear-gradient(135deg, ${tintFrom}, ${tintTo})` }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.65),transparent_58%)]" />
        {images.length > 0 ? (
          <button type="button" onClick={() => setActiveIndex(0)} aria-label={`Open ${title} photo`} className="absolute inset-0 block h-full w-full cursor-zoom-in">
            <Image
              src={images[0]}
              alt={title}
              fill
              sizes="(max-width: 639px) 100vw, 50vw"
              quality={75}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">View photos</span>
          </button>
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[112px] drop-shadow-[0_16px_30px_rgba(25,23,20,0.18)] sm:text-[190px]">{emoji}</span>
        )}
        {badge ? <span className="absolute left-5 top-5 rounded-full bg-ink/85 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-paper backdrop-blur-sm">{badge}</span> : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((image, index) => (
            <button key={image} type="button" onClick={() => setActiveIndex(index)} aria-label={`View photo ${index + 1} of ${images.length}`} className="overflow-hidden rounded-lg ring-1 ring-black/5 transition hover:ring-2 hover:ring-clay focus-visible:outline-2 focus-visible:outline-clay">
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
        <div role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <button type="button" onClick={() => setActiveIndex(null)} aria-label="Close photo viewer" className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-3xl leading-none text-white hover:bg-white/25">×</button>
          {images.length > 1 ? (
            <button type="button" onClick={() => setActiveIndex((activeIndex! - 1 + images.length) % images.length)} aria-label="Previous photo" className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25 sm:left-6">‹</button>
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
            <figcaption className="text-sm text-white/80">{title} · {(activeIndex ?? 0) + 1} of {images.length}</figcaption>
          </figure>
          {images.length > 1 ? (
            <button type="button" onClick={() => setActiveIndex(((activeIndex ?? 0) + 1) % images.length)} aria-label="Next photo" className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25 sm:right-6">›</button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
