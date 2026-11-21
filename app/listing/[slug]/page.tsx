import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import AddToCartForm from "@/components/AddToCartForm";
import FavoriteButton from "@/components/FavoriteButton";
import ImageGallery from "@/components/ImageGallery";
import ReviewForm from "@/components/ReviewForm";
import SellerWidget from "@/components/SellerWidget";
import SiteHeader from "@/components/SiteHeader";
import Stars from "@/components/Stars";
import { getCurrentUser } from "@/lib/auth";
import { countReviews, getProduct, getSellerByName, isInCart, listProducts, listReviews } from "@/lib/db";
import { countryName, flagFor } from "@/lib/countries";
import { currencyForCountry } from "@/lib/currency";
import { formatDate, formatPrice, initials } from "@/lib/format";
import { getDurableProduct } from "@/lib/durable-products";
import { getDurableSellerForListing } from "@/lib/durable-sellers";
import { getDurableReviews } from "@/lib/durable-reviews";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getDurableProduct(slug)) ?? getProduct(slug);
  if (!product) return { title: "Listing not found" };
  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getDurableProduct(slug)) ?? getProduct(slug);
  if (!product) notFound();

  const related = listProducts({ category: product.category, limit: 5, imageMode: "cover" })
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4);

  const localSeller = getSellerByName(product.seller);
  const localReviews = listReviews(product.slug);
  const localReviewCount = countReviews(product.slug);
  const seller = localSeller ?? getDurableSellerForListing(product);
  const [durableReviewData, user] = await Promise.all([
    getDurableReviews(product.slug),
    getCurrentUser(),
  ]);
  const reviews = [...localReviews, ...durableReviewData.reviews]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
  const reviewCount = localReviewCount + durableReviewData.count;
  const ratingCount = product.reviews + durableReviewData.count;
  const rating = ratingCount > 0
    ? (product.rating * product.reviews + durableReviewData.averageRating * durableReviewData.count) / ratingCount
    : product.rating;
  const ownListing = product.ownerId
    ? product.ownerId === String(user?.id)
    : user?.name === product.seller;
  const inCart = user && !ownListing
    ? (user.cart ?? []).includes(product.slug) || isInCart(user.email, product.slug)
    : false;
  const messagePath = `/messages/new?listing=${encodeURIComponent(product.slug)}`;
  const messageHref = user ? messagePath : `/signin?next=${encodeURIComponent(messagePath)}`;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pt-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-soft sm:text-sm">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/?category=${product.category}&county=${encodeURIComponent(product.county)}#trending`}
            className="transition-colors hover:text-ink"
          >
            {product.categoryName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{product.title}</span>
        </nav>

        <div className="mt-6 grid gap-8 sm:mt-9 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <ImageGallery
              images={product.images}
              title={product.title}
              tintFrom={product.tintFrom}
              tintTo={product.tintTo}
              emoji={product.emoji}
              badge={product.badge}
            />
            <p className="mt-3 text-xs text-ink-soft">
              {product.images.length > 0
                ? `${product.images.length} of up to 5 photos · tap a photo to view it here.`
                : "No photos added yet — ask the seller about condition before buying."}
            </p>
          </div>

          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">{product.categoryName}</p>
            <h1 className="mt-3 text-3xl leading-[1.1] sm:mt-4 sm:text-4xl lg:text-[2.6rem]">{product.title}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-soft">
              {ratingCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-highlight">★</span>
                  <span className="font-medium text-ink">{rating.toFixed(1)}</span>
                  <span>({ratingCount.toLocaleString("en-US")} ratings)</span>
                </span>
              ) : (
                <span className="text-xs font-medium text-clay">New listing · no ratings yet</span>
              )}
              <span aria-hidden="true">·</span>
              <span>
                by{" "}
                {seller ? (
                  <Link href={`/seller/${seller.slug}`} prefetch={false} className="font-medium text-ink underline-offset-4 transition-colors hover:text-clay hover:underline">
                    {product.seller}
                  </Link>
                ) : (
                  <span className="font-medium text-ink">{product.seller}</span>
                )}
                {product.verified ? (
                  <span className="ml-2 inline-flex items-center gap-1 align-middle text-xs font-medium text-clay">
                    <span aria-hidden="true">✓</span> Verified
                  </span>
                ) : null}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {product.location} · {product.county}
              </span>
            </div>

            <p className="mt-7 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {formatPrice(product.price, currencyForCountry(product.country))}
            </p>
            <p className="mt-1.5 text-xs text-ink-soft">Local pickup or shipping · {countryName(product.country)}</p>

            <p className="mt-8 border-t border-line pt-8 text-[15px] leading-7 text-ink-soft">
              {product.description}
            </p>

            <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-line pt-7 text-sm sm:pt-8">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Sold by</dt>
                <dd className="mt-2 font-medium text-ink">
                  {seller ? (
                    <Link href={`/seller/${seller.slug}`} prefetch={false} className="underline-offset-4 transition-colors hover:text-clay hover:underline">
                      {product.seller}
                    </Link>
                  ) : (
                    product.seller
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Ships from</dt>
                <dd className="mt-2 font-medium text-ink">
                  {product.location}
                  <span className="block text-xs font-normal text-ink-soft">
                    {product.county} · {flagFor(product.country)} {countryName(product.country)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Category</dt>
                <dd className="mt-2 font-medium text-ink">{product.categoryName}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Condition</dt>
                <dd className="mt-2 font-medium text-ink">{product.condition}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Seller status</dt>
                <dd className="mt-2 font-medium text-ink">
                  {product.verified ? "Verified seller" : "New seller"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Listed</dt>
                <dd className="mt-2 font-medium text-ink">{formatDate(product.createdAt)}</dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-start">
              {product.status === "sold" ? (
                <span className="flex h-12 flex-1 items-center justify-center rounded-full bg-paper-2 px-6 text-sm font-medium text-ink-soft" aria-label="This item has sold">
                  Sold
                </span>
              ) : ownListing ? (
                <Link
                  href="/messages"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-sm font-medium text-ink transition-colors hover:border-clay hover:text-clay"
                >
                  Open your inbox
                  <span aria-hidden="true">→</span>
                </Link>
              ) : inCart ? (
                <Link
                  href="/cart"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-clay px-6 text-sm font-semibold tracking-tight text-on-dark transition-colors hover:bg-clay-dark"
                >
                  In your cart · View cart
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <AddToCartForm slug={product.slug} />
              )}
              {!ownListing ? (
                <Link
                  href={messageHref}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-clay hover:text-clay sm:flex-none"
                >
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
                    <path d="M8 9h8M8 12h5" />
                  </svg>
                  Message seller
                </Link>
              ) : null}
              <FavoriteButton
                slug={product.slug}
                signedIn={Boolean(user)}
                initiallySaved={Boolean(user?.favorites?.includes(product.slug))}
              />
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
              {ownListing
                ? "This is your listing — buyer messages appear in your inbox."
                : user
                  ? `Payment and pickup are arranged with ${product.seller} · ${product.seller} usually replies within a day`
                  : "Sign in with your email to add this to your cart and message the seller · free to message"}
            </p>
          </div>
        </div>

        {seller ? (
          <section className="mt-14 border-t border-line pt-8 sm:mt-20 sm:pt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl sm:text-2xl">About the seller</h2>
              <Link
                href={`/seller/${seller.slug}`}
                prefetch={false}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-clay"
              >
                View profile →
              </Link>
            </div>
            <SellerWidget seller={seller} />
          </section>
        ) : null}

        <section id="reviews" className="mt-14 scroll-mt-24 sm:mt-20">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="border-b border-line pb-4 sm:pb-5">
                <h2 className="text-xl sm:text-2xl">Reviews</h2>
                <p className="mt-1.5 text-xs text-ink-soft">
                  {reviewCount} written {reviewCount === 1 ? "review" : "reviews"} ·{" "}
                  {ratingCount.toLocaleString("en-US")} ratings
                </p>
              </div>

              {reviews.length > 0 ? (
                <ul className="divide-y divide-line">
                  {reviews.map((review) => (
                    <li key={review.id} className="py-6">
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 rounded-xl border border-dashed border-line bg-surface/60 px-5 py-10 text-center text-sm text-ink-soft">
                  No written reviews yet. Be the first to share your experience.
                </p>
              )}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <ReviewForm slug={product.slug} signedIn={Boolean(user)} next={`/listing/${product.slug}`} />
            </div>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mt-14 sm:mt-24">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-5">
              <h2 className="text-xl sm:text-2xl">More in {product.categoryName}</h2>
              <Link
                href={`/?category=${product.category}#trending`}
                className="shrink-0 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                See all →
              </Link>
            </div>
            <div className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

    </>
  );
}
