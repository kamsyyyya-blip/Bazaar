import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/db";
import { currencyForCountry } from "@/lib/currency";
import { formatPrice } from "@/lib/format";
import FavoriteButton from "./FavoriteButton";

type Props = {
  product: Product;
  favorite?: { signedIn: boolean; initiallySaved: boolean };
};

/** Image-led listing card used across the marketplace grid. */
export default function MarketplaceCard({ product, favorite }: Props) {
  return (
    <article className="group relative min-w-0">
      <Link
        href={`/listing/${product.slug}`}
        prefetch={false}
        className="block focus-visible:rounded-2xl"
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
              className="absolute inset-0 grid place-items-center text-5xl drop-shadow-[0_6px_14px_rgba(34,34,34,0.12)] transition-transform duration-500 ease-out group-hover:scale-110"
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
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink">{product.title}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
            <span className="truncate">{product.county}</span>
            <span aria-hidden="true" className="shrink-0">·</span>
            <span className="shrink-0">{product.condition}</span>
          </p>
        </div>
      </Link>

      {favorite ? (
        <FavoriteButton
          slug={product.slug}
          signedIn={favorite.signedIn}
          initiallySaved={favorite.initiallySaved}
          overlay
        />
      ) : null}
    </article>
  );
}
