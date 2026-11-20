import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { removeFromCartAction } from "@/app/actions/cart";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { currencyForCountry } from "@/lib/currency";
import { getProduct, listCartProductSlugs, type Product } from "@/lib/db";
import { getDurableProduct } from "@/lib/durable-products";
import { formatPrice, pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cart",
  description: "Items you are ready to buy on Bazaar.",
};

export default async function CartPage() {
  const user = await getCurrentUser();
  const cartSlugs = user
    ? [...new Set([...(user.cart ?? []), ...listCartProductSlugs(user.email)])]
    : [];
  const resolvedItems = await Promise.all(cartSlugs.map(async (slug) => await getDurableProduct(slug) ?? getProduct(slug)));
  const items = resolvedItems.filter((product): product is Product => product !== null && product.status !== "sold");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Cart</span>
        </nav>

        <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:mt-6 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Cart</p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-4xl">Your cart</h1>
            <p className="mt-2 text-sm text-ink-soft">
              {items.length > 0
                ? `${pluralize(items.length, "item")} saved. Message each seller to agree on payment and pickup.`
                : user
                  ? "Nothing saved yet. Add a listing and it will wait for you here."
                  : "Sign in to save listings to a cart that follows you across visits."}
            </p>
          </div>
          <Link
            href="/#trending"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition hover:border-ink/25 sm:w-auto"
          >
            Keep browsing
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section aria-label="Items in your cart">
              <ul className="space-y-3">
                {items.map((product) => (
                  <li
                    key={product.slug}
                    className="flex gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:border-ink/20 sm:gap-4 sm:p-4"
                  >
                    <Link
                      href={`/listing/${product.slug}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 sm:h-24 sm:w-24"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})`,
                      }}
                    >
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          sizes="96px"
                          quality={60}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-4xl">
                          {product.emoji}
                        </span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                        <div className="min-w-0">
                          <Link
                            href={`/listing/${product.slug}`}
                            className="font-display text-lg leading-snug transition hover:text-clay"
                          >
                            {product.title}
                          </Link>
                          <p className="mt-1 text-xs text-ink-soft">
                            {product.seller} · {product.county} · {product.condition}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold tabular-nums">
                          {formatPrice(product.price, currencyForCountry(product.country))}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                        <Link
                          href={`/listing/${product.slug}`}
                          className="text-xs font-semibold text-ink-soft transition hover:text-ink"
                        >
                          View listing →
                        </Link>
                        <form action={removeFromCartAction}>
                          <input type="hidden" name="slug" value={product.slug} />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-clay transition hover:text-danger"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
                <h2 className="font-display text-xl">Summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-soft">Items</dt>
                    <dd className="font-semibold">{items.length}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                    <dt className="text-ink-soft">Payment</dt>
                    <dd className="text-right font-medium">With each seller</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                    <dt className="text-ink-soft">Pickup</dt>
                    <dd className="text-right font-medium">Local or shipping</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                  Bazaar is a classifieds marketplace, so you arrange payment and handover directly with the seller.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <section className="mt-6 rounded-2xl border border-line bg-surface p-5 text-center sm:mt-8 sm:p-12">
            <span
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-paper-2 text-ink-soft"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path
                  d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="20" r="1.2" />
                <circle cx="17.5" cy="20" r="1.2" />
              </svg>
            </span>
            <h2 className="mt-4 font-display text-2xl">{user ? "Your cart is empty" : "Sign in to use your cart"}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              {user
                ? "Browse what sellers near you have listed, then add anything you like to your cart."
                : "Your saved items stay with your account, so you can pick up where you left off."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#trending"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-clay px-5 text-sm font-semibold text-on-dark transition hover:bg-clay-dark"
              >
                Browse listings
                <span aria-hidden="true">→</span>
              </Link>
              {!user ? (
                <Link
                  href={`/signin?next=${encodeURIComponent("/cart")}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold transition hover:border-ink/25"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </section>
        )}
      </main>

    </>
  );
}
