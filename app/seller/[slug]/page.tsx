import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketplaceCard from "@/components/MarketplaceCard";
import SiteHeader from "@/components/SiteHeader";
import Stars from "@/components/Stars";
import { getSellerBySlug, listCategories, listSellerReviews } from "@/lib/db";
import { formatDate, initials } from "@/lib/format";
import { getDurableSellerBySlug, getDurableSellerReviews, mergeSellerProfiles } from "@/lib/durable-sellers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const localSeller = getSellerBySlug(slug);
  const durableSeller = localSeller ? null : await getDurableSellerBySlug(slug);
  const seller = mergeSellerProfiles(localSeller, durableSeller);
  if (!seller) return { title: "Seller not found" };
  return {
    title: seller.name,
    description: `Browse ${seller.listings} listings from ${seller.name} in ${seller.county}.`,
  };
}

export default async function SellerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const localSeller = getSellerBySlug(slug);
  const durableSeller = localSeller ? null : await getDurableSellerBySlug(slug);
  const seller = mergeSellerProfiles(localSeller, durableSeller);
  if (!seller) notFound();

  const durableReviewData = await getDurableSellerReviews(seller);
  const reviews = [...listSellerReviews(seller.name, 4), ...durableReviewData.reviews]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const ratingCount = seller.reviews + durableReviewData.count;
  const rating = ratingCount > 0
    ? (seller.rating * seller.reviews + durableReviewData.averageRating * durableReviewData.count) / ratingCount
    : seller.rating;
  const categoryLinks = listCategories().filter((category) => seller.categories.includes(category.name));

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{seller.name}</span>
        </nav>

        <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface sm:mt-6 sm:rounded-3xl">
          <div
            className="h-24 sm:h-28"
            style={{
              backgroundImage: "linear-gradient(120deg, var(--color-accent-soft), var(--color-paper-2) 55%, var(--color-line))",
            }}
          />

          <div className="px-4 pb-5 sm:px-8 sm:pb-8">
            <div className="-mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-4 border-surface text-xl font-semibold text-on-dark shadow-soft sm:h-20 sm:w-20 sm:text-2xl"
                  style={{ backgroundColor: seller.avatarColor }}
                >
                  {initials(seller.name)}
                </span>
                <div className="min-w-0 pb-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl leading-tight sm:text-4xl">{seller.name}</h1>
                    {seller.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-clay">
                        <span aria-hidden="true">✓</span> Verified seller
                      </span>
                    ) : (
                      <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                        New seller
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {seller.location} · {seller.county} · Joined {formatDate(seller.joined)}
                  </p>
                </div>
              </div>

              <Link
                href={`/messages/new?listing=${seller.products[0].slug}`}
                className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-clay px-6 text-sm font-medium text-on-dark transition hover:bg-clay-dark sm:w-auto"
              >
                Message seller
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-soft">{seller.bio}</p>

            <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-line pt-4 sm:mt-6 sm:gap-4 sm:pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">Seller rating</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <Stars value={rating} />
                  {rating.toFixed(1)}
                  <span className="font-normal text-ink-soft">({ratingCount.toLocaleString("en-US")})</span>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">Active listings</dt>
                <dd className="mt-1 text-sm font-medium">{seller.listings}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">State / province</dt>
                <dd className="mt-1 text-sm font-medium">{seller.county}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">Response time</dt>
                <dd className="mt-1 text-sm font-medium">Usually within a day</dd>
              </div>
            </dl>

            {categoryLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {categoryLinks.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/?category=${category.slug}&county=${encodeURIComponent(seller.county)}#trending`}
                    className="rounded-full border border-line bg-paper-2/60 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink"
                  >
                    <span aria-hidden="true" className="mr-1">
                      {category.emoji}
                    </span>
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-9 sm:mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-3xl">Listings from {seller.name}</h2>
              <p className="mt-1 text-xs text-ink-soft">
                {seller.listings} active {seller.listings === 1 ? "listing" : "listings"} · {seller.county}
              </p>
            </div>
            <Link
              href={`/?county=${encodeURIComponent(seller.county)}#trending`}
              className="text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              Everything in {seller.county} →
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {seller.products.map((product) => (
              <MarketplaceCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-10 sm:mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl">Reviews for this seller</h2>
              <p className="mt-1 text-xs text-ink-soft">
                Recent notes from buyers in and around {seller.county}.
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Stars value={rating} />
              <span className="font-medium text-ink">{rating.toFixed(1)}</span>
              <span>({ratingCount.toLocaleString("en-US")} ratings)</span>
            </p>
          </div>

          {reviews.length > 0 ? (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper-2 text-xs font-semibold text-ink-soft"
                    >
                      {initials(review.authorName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{review.authorName}</p>
                      <p className="text-[12px] text-ink-soft">{formatDate(review.createdAt)}</p>
                    </div>
                    <Stars value={review.rating} className="ml-auto shrink-0 text-sm" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{review.body}</p>
                  {review.productTitle && review.productSlug ? (
                    <Link
                      href={`/listing/${review.productSlug}`}
                      className="mt-3 inline-flex text-[12px] font-medium text-ink-soft transition hover:text-ink"
                    >
                      On “{review.productTitle}” →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface/60 px-5 py-10 text-center text-sm text-ink-soft">
              No written reviews yet. Be the first after your next purchase.
            </p>
          )}
        </section>
      </main>

    </>
  );
}
