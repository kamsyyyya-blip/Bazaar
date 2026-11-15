import Link from "next/link";
import type { Product } from "@/lib/db";
import { currencyForCountry } from "@/lib/currency";
import { formatPrice } from "@/lib/format";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/listing/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.65),transparent_58%)]" />
        {product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center text-6xl drop-shadow-[0_6px_14px_rgba(25,23,20,0.15)] transition-transform duration-500 ease-out group-hover:scale-110"
          >
            {product.emoji}
          </span>
        )}

        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-paper backdrop-blur-sm">
            {product.badge}
          </span>
        ) : null}

        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 rounded-full bg-white/70 px-2.5 py-1 text-[12px] font-medium text-ink-soft opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
        >
          View listing →
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[18px] leading-snug">{product.title}</h3>
          <p className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums">{formatPrice(product.price, currencyForCountry(product.country))}</p>
        </div>
        <p className="text-[14px] text-ink-soft">
          {product.seller} <span className="text-ink-soft/40">·</span> {product.county}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-ink-soft">
          <span aria-hidden="true" className="text-clay">
            ★
          </span>
          <span className="font-medium text-ink">{product.rating.toFixed(1)}</span>
          <span className="text-ink-soft">({product.reviews})</span>
        </div>
      </div>
    </Link>
  );
}
