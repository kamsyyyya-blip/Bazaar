import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/db";
import { currencyForCountry } from "@/lib/currency";
import { formatPrice } from "@/lib/format";

type Props = {
  product: Product;
};

/** Compact related-listing card with the same image-led treatment as the grid. */
export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/listing/${product.slug}`}
      prefetch={false}
      className="group block min-w-0"
    >
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2"
        style={{ backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})` }}
      >
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 23vw"
            quality={60}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center text-5xl transition-transform duration-500 ease-out group-hover:scale-110"
          >
            {product.emoji}
          </span>
        )}
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-on-dark">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="px-0.5 pt-3">
        <p className="text-base font-semibold tabular-nums tracking-tight">
          {formatPrice(product.price, currencyForCountry(product.country))}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{product.title}</h3>
        <p className="mt-1.5 text-xs text-ink-soft">
          {product.county} <span aria-hidden="true">·</span> {product.condition}
        </p>
      </div>
    </Link>
  );
}
