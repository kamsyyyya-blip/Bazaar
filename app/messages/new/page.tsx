import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import MessageComposer from "@/components/MessageComposer";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { currencyForCountry } from "@/lib/currency";
import { findConversationForProduct, getProduct, getSellerByName } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { getDurableProduct } from "@/lib/durable-products";

export const metadata: Metadata = {
  title: "Message seller",
  description: "Ask a Bazaar seller about condition, pickup or price.",
};

export default async function NewMessagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.listing) ? params.listing[0] : params.listing;
  const slug = (raw ?? "").trim();

  const user = await getCurrentUser();
  const next = `/messages/new${slug ? `?listing=${encodeURIComponent(slug)}` : ""}`;
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);

  const product = slug ? await getDurableProduct(slug) ?? getProduct(slug) : null;
  if (!product) notFound();

  const existing = findConversationForProduct(product.slug, user.email);
  if (existing) redirect(`/messages/${existing.id}`);

  const seller = getSellerByName(product.seller);
  const ownListing = product.ownerId ? product.ownerId === String(user.id) : product.seller === user.name;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/listing/${product.slug}`} className="max-w-[16rem] truncate transition hover:text-ink">
            {product.title}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Message seller</span>
        </nav>

        <h1 className="mt-5 text-2xl leading-tight sm:mt-6 sm:text-4xl">Message {product.seller}</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Ask about condition, measurements or a pickup time. Your email stays private and replies land in your Bazaar
          inbox.
        </p>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:mt-7 sm:gap-4 sm:p-4 sm:flex-row sm:items-center">
          <span
            aria-hidden="true"
            className="grid h-20 w-20 shrink-0 place-items-center rounded-xl text-4xl ring-1 ring-black/5"
            style={{
              backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})`,
            }}
          >
            {product.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold leading-snug">{product.title}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {formatPrice(product.price, currencyForCountry(product.country))} · {product.condition} · {product.location} · {product.county}
            </p>
            {seller ? (
              <Link
                href={`/seller/${seller.slug}`}
                className="mt-1.5 inline-flex text-xs font-medium text-ink underline-offset-4 hover:underline"
              >
                View seller page →
              </Link>
            ) : null}
          </div>
          <Link
            href={`/listing/${product.slug}`}
            className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-full border border-line px-4 text-sm font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink sm:w-auto"
          >
            Back to listing
          </Link>
        </div>

        <section className="mt-5 rounded-2xl border border-line bg-surface p-4 sm:mt-6 sm:p-7">
          {ownListing ? (
            <div className="rounded-xl border border-dashed border-line bg-paper-2/40 px-5 py-8 text-center">
              <p className="text-2xl" aria-hidden="true">
                🏷️
              </p>
              <h2 className="mt-3 text-xl">This is your listing</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                Buyers will message you here. Open your inbox to see any conversations.
              </p>
              <Link
                href="/messages"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
              >
                Open your inbox
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <MessageComposer slug={product.slug} />
          )}
        </section>

        <p className="mt-4 text-center text-[12px] text-ink-soft">
          Only share what you&rsquo;re comfortable with. Never send bank details or one-time codes.
        </p>
      </main>

    </>
  );
}
