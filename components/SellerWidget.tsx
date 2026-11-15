import Link from "next/link";
import type { Seller } from "@/lib/db";
import Stars from "./Stars";

/** Seller card shown on the listing page, directly above the reviews. */
export default function SellerWidget({ seller }: { seller: Seller }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-semibold text-paper"
          style={{ backgroundColor: seller.avatarColor }}
        >
          {seller.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/seller/${seller.slug}`}
              className="font-display text-xl leading-tight transition hover:text-clay"
            >
              {seller.name}
            </Link>
            {seller.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-olive/10 px-2 py-0.5 text-[11px] font-medium text-olive">
                <span aria-hidden="true">✓</span> Verified seller
              </span>
            ) : (
              <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                New seller
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            {seller.location} · {seller.county} · {seller.listings} active{" "}
            {seller.listings === 1 ? "listing" : "listings"}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft">
            <Stars value={seller.rating} />
            <span className="font-medium text-ink">{seller.rating.toFixed(1)}</span>
            <span>({seller.reviews.toLocaleString("en-US")} ratings)</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Link
          href={`/seller/${seller.slug}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-paper transition hover:bg-clay"
        >
          View seller page
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
