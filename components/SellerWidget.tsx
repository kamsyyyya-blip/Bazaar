import Link from "next/link";
import type { Seller } from "@/lib/db";
import Stars from "./Stars";

/** Seller card shown on the listing page, directly above the reviews. */
export default function SellerWidget({ seller }: { seller: Seller }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-semibold text-on-dark"
          style={{ backgroundColor: seller.avatarColor }}
        >
          {seller.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link
              href={`/seller/${seller.slug}`}
              prefetch={false}
              className="text-xl leading-tight text-ink underline-offset-4 transition hover:text-clay hover:underline"
            >
              {seller.name}
            </Link>
            {seller.verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-clay">
                <span aria-hidden="true">✓</span> Verified seller
              </span>
            ) : (
              <span className="text-[11px] font-medium text-ink-soft">New seller</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">
            {seller.location} · {seller.county} · {seller.listings} active{" "}
            {seller.listings === 1 ? "listing" : "listings"}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
            <Stars value={seller.rating} />
            <span className="font-medium text-ink">{seller.rating.toFixed(1)}</span>
            <span>({seller.reviews.toLocaleString("en-US")} ratings)</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Link
          href={`/seller/${seller.slug}`}
          prefetch={false}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink transition hover:border-clay hover:text-clay"
        >
          View seller page
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
