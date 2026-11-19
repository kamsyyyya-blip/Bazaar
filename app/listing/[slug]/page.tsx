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

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/?category=${product.category}&county=${encodeURIComponent(product.county)}#trending`}
            className="transition hover:text-ink"
          >
            {product.categoryName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{product.title}</span>
        </nav>

        <div className="mt-5 grid gap-6 sm:mt-8 sm:gap-10 lg:grid-cols-2 lg:gap-14">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{product.categoryName}</p>
            <h1 className="mt-2 text-2xl leading-tight sm:mt-3 sm:text-4xl">{product.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
              {ratingCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-clay">
                    ★
                  </span>
                  <span className="font-medium text-ink">{rating.toFixed(1)}</span>
                  <span>({ratingCount.toLocaleString("en-US")} ratings)</span>
                </span>
              ) : (
                <span className="rounded-full bg-olive/10 px-2 py-0.5 text-xs font-medium text-olive">
                  New listing · no ratings yet
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span>
                by{" "}
                {seller ? (
                  <Link href={`/seller/${seller.slug}`} prefetch={false} className="font-medium text-ink underline-offset-4 hover:underline">
                    {product.seller}
                  </Link>
                ) : (
                  <span className="font-medium text-ink">{product.seller}</span>
                )}
                {product.verified ? (
                  <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-olive/10 px-1.5 py-0.5 align-middle text-[11px] font-medium text-olive">
                    <span aria-hidden="true">✓</span> Verified
                  </span>
                ) : null}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {product.location} · {product.county}
              </span>
            </div>

            <p className="mt-6 text-2xl font-semibold tabular-nums">{formatPrice(product.price, currencyForCountry(product.country))}</p>
            <p className="mt-1 text-xs text-ink-soft">Local pickup or shipping · {countryName(product.country)}</p>

            <p className="mt-7 border-t border-line pt-7 text-[16px] leading-relaxed text-ink-soft">
              {product.description}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5 text-sm sm:mt-7 sm:gap-x-6 sm:pt-7">
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-ink-soft">Sold by</dt>
                <dd className="mt-1 font-medium">
                  {seller ? (
                    <Link href={`/seller/${seller.slug}`} prefetch={false} className="underline-offset-4 hover:underline">
                      {product.seller}
                    </Link>
                  ) : (
                    product.seller
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-ink-soft">Ships from</dt>
                <dd className="mt-1 font-medium">
                  {product.location}
                  <span className="block text-xs font-normal text-ink-soft">
                    {product.county} · {flagFor(product.country)} {countryName(product.country)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-ink-soft">Category</dt>
                <dd className="mt-1 font-medium">{product.categoryName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-ink-soft">Condition</dt>
                <dd className="mt-1 font-medium">{product.condition}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-ink-soft">Seller status</dt>
                <dd className="mt-1 font-medium">
                  {product.verified ? "Verified seller" : "New seller"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-ink-soft">Listed</dt>
                <dd className="mt-1 font-medium">{formatDate(product.createdAt)}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {product.status === "sold" ? (
                <span className="flex h-12 flex-1 items-center justify-center rounded-full bg-ink/10 px-6 text-sm font-semibold text-ink-soft" aria-label="This item has sold">
                  Sold
                </span>
              ) : ownListing ? (
                <Link
                  href="/messages"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-6 text-sm font-medium transition hover:border-ink/35"
                >
                  Open your inbox
                  <span aria-hidden="true">→</span>
                </Link>
              ) : inCart ? (
                <Link
                  href="/cart"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-olive px-6 text-sm font-semibold text-paper transition hover:bg-olive/90"
                >
                  In your cart · View cart
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <AddToCartForm slug={product.slug} />
              )}
              <FavoriteButton
                slug={product.slug}
                signedIn={Boolean(user)}
                initiallySaved={Boolean(user?.favorites?.includes(product.slug))}
              />
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-olive" />
              {ownListing
                ? "This is your listing — buyer messages appear in your inbox."
                : user
                  ? `Payment and pickup are arranged with ${product.seller} · ${product.seller} usually replies within a day`
                  : "Sign in with your email to add this to your cart and message the seller · free to message"}
            </p>
          </div>
        </div>

        {seller ? (
          <section className="mt-10 border-t border-line pt-7 sm:mt-16 sm:pt-10">
            <h2 className="mb-4 text-2xl">About the seller</h2>
            <SellerWidget seller={seller} />
          </section>
        ) : null}

        <section id="reviews" className="mt-10 scroll-mt-24 sm:mt-12">
          <div className="grid gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="border-b border-line pb-4">
                <h2 className="text-2xl">Reviews</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  {reviewCount} written {reviewCount === 1 ? "review" : "reviews"} ·{" "}
                  {ratingCount.toLocaleString("en-US")} ratings
                </p>
              </div>

              {reviews.length > 0 ? (
                <ul className="mt-2 divide-y divide-line">
                  {reviews.map((review) => (
                    <li key={review.id} className="py-5">
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
                <p className="mt-5 rounded-2xl border border-dashed border-line bg-white/60 px-5 py-10 text-center text-sm text-ink-soft">
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
          <section className="mt-12 sm:mt-20">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl">More in {product.categoryName}</h2>
              <Link
                href={`/?category=${product.category}#trending`}
                className="text-sm font-medium text-ink-soft transition hover:text-ink"
              >
                See all →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
