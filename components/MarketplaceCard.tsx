import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/db";
import { currencyForCountry } from "@/lib/currency";
import { formatPrice } from "@/lib/format";

/** Dense classifieds-style card used across the marketplace grid. */
export default function MarketplaceCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/listing/${product.slug}`}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.6),transparent_58%)]" />
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 23vw"
            quality={60}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center text-5xl drop-shadow-[0_6px_14px_rgba(25,23,20,0.15)] transition-transform duration-500 ease-out group-hover:scale-110"
          >
            {product.emoji}
          </span>
        )}

        {product.badge ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-clay/85 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-on-dark backdrop-blur-sm">
            {product.badge}
          </span>
        ) : null}

        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-ink-soft backdrop-blur-sm">
          {product.condition}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[18px] font-semibold leading-none tabular-nums">{formatPrice(product.price, currencyForCountry(product.country))}</p>
        <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">{product.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{product.description}</p>

        <p className="mt-2 flex items-center gap-1 text-[12px] text-ink-soft">
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
          <span className="truncate">{product.county}</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line/70 pt-2.5">
          <span className="truncate text-[12px] text-ink-soft">{product.seller}</span>
          {product.verified ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-clay">
              <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4">
                <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Verified
            </span>
          ) : (
            <span className="shrink-0 text-[11px] text-ink-soft">New seller</span>
          )}
        </div>
      </div>
    </Link>
  );
}
