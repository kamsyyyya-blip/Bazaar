import Link from "next/link";
import CountryPicker from "@/components/CountryPicker";
import MarketplaceCard from "@/components/MarketplaceCard";
import MarketplaceSidebar from "@/components/MarketplaceSidebar";
import SearchForm from "@/components/SearchForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SortSelect from "@/components/SortSelect";
import { countryName, flagFor, HOME_COUNTRY } from "@/lib/countries";
import {
  listCategories,
  listCountryCounts,
  listFeatured,
  listProducts,
} from "@/lib/db";
import { browseHref, hasActiveFilters, pageHref, parseFilters, priceFilters } from "@/lib/filters";
import { currencyForCountry } from "@/lib/currency";
import { pluralize } from "@/lib/format";
import { detectCountry } from "@/lib/geo";
import { listAllDurableProducts } from "@/lib/durable-products";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
const LISTINGS_PER_PAGE = 24;
// Clear the current homepage sample posts without deleting their stored data.
const CLEARED_HOME_LISTINGS = new Set(["gaming-mouse", "hp-laptop", "laptop"]);

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={[
        "-mb-px shrink-0 border-b-2 pb-2.5 text-sm transition",
        active
          ? "border-clay font-medium text-ink"
          : "border-transparent text-ink-soft hover:border-line hover:text-ink",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const pageParam = Array.isArray(params.p) ? params.p[0] : params.p ?? "1";
  const requestedPage = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const durableProductsPromise = listAllDurableProducts();
  const detected = await detectCountry();
  const currency = currencyForCountry(filters.country || detected || HOME_COUNTRY);
  const priceOptions = priceFilters(currency);
  const categories = listCategories(filters.county, filters.country);
  const countryCounts = Object.fromEntries(
    listCountryCounts().map((country) => [country.code, country.count]),
  ) as Record<string, number>;
  const featured = listFeatured(4).filter((product) => !CLEARED_HOME_LISTINGS.has(product.slug));
  const productsFromDb = listProducts({ ...filters, maxPrice: filters.max, imageMode: "cover" });
  const durableProducts = await durableProductsPromise;
  const durableBySlug = new Map(durableProducts.map((product) => [product.slug, product]));
  const query = filters.q.toLowerCase();
  const matchingProducts = [
    ...productsFromDb.filter((product) =>
      !durableBySlug.has(product.slug) && !CLEARED_HOME_LISTINGS.has(product.slug),
    ),
    ...durableProducts.filter((product) => {
      if (CLEARED_HOME_LISTINGS.has(product.slug)) return false;
      if (product.status === "sold") return false;
      if (filters.category && product.category !== filters.category) return false;
      if (filters.county && product.county !== filters.county) return false;
      if (filters.country && product.country !== filters.country) return false;
      if (filters.max && product.price > filters.max) return false;
      if (
        query &&
        ![product.title, product.description, product.seller, product.location, product.county, product.categoryName, product.country]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) return false;
      return true;
    }),
  ].sort((a, b) => {
    switch (filters.sort) {
      case "newest": return b.createdAt.localeCompare(a.createdAt);
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating": return b.rating - a.rating || b.reviews - a.reviews;
      default: return Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || b.rating - a.rating || b.reviews - a.reviews;
    }
  });
  const totalPages = Math.max(1, Math.ceil(matchingProducts.length / LISTINGS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * LISTINGS_PER_PAGE;
  const products = matchingProducts
    .slice(pageStart, pageStart + LISTINGS_PER_PAGE)
    .map((product) => ({ ...product, images: product.images.slice(0, 1) }));
  const featuredAds = (featured.length > 0 ? featured : matchingProducts.slice(0, 4))
    .map((product) => ({ ...product, images: product.images.slice(0, 1) }));
  const categoryTotal = categories.reduce((total, category) => total + category.count, 0);
  const countryEmpty = Boolean(filters.country) && (countryCounts[filters.country] ?? 0) === 0;
  const activeCategory = categories.find((item) => item.slug === filters.category);
  const filtered = hasActiveFilters(filters);
  const marketplaceEmpty = matchingProducts.length === 0 && !filtered;
  const user = await getCurrentUser();
  const favoriteFor = (slug: string) => ({
    signedIn: Boolean(user),
    initiallySaved: Boolean(user?.favorites?.includes(slug)),
  });
  const heading = filters.q
    ? `Results for “${filters.q}”`
    : marketplaceEmpty
      ? "No listings yet"
      : countryEmpty
        ? "No listings available"
        : activeCategory
        ? activeCategory.name
        : filters.county
          ? `Trending in ${filters.county}`
          : filters.country
            ? `Trending in ${countryName(filters.country)}`
            : "Latest ads";

  return (
    <>
      <SiteHeader
        query={filters.q}
        county={filters.county}
        country={filters.country}
        max={filters.max}
        sort={filters.sort}
      />

      <main>
        {/* compact search band — discovery stays front and centre */}
        <section id="search" className="scroll-mt-20 bg-paper lg:border-b lg:border-line">
          <div className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pb-10 lg:pt-10">
            <div className="flex max-w-5xl flex-col gap-2.5 lg:flex-row">
              <div className="min-w-0 flex-1">
                <SearchForm
                  defaultValue={filters.q}
                  category={filters.category}
                  county={filters.county}
                  country={filters.country}
                  max={filters.max}
                  sort={filters.sort}
                />
              </div>
              <CountryPicker
                value={filters.country}
                detected={detected}
                counts={countryCounts}
                q={filters.q}
                category={filters.category}
                county={filters.county}
                maxPrice={filters.max}
                sort={filters.sort}
              />
            </div>

            {detected && !filters.country ? (
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                <span aria-hidden="true">📍</span>
                {detected === HOME_COUNTRY ? (
                  <span>
                    Location detected: <span className="font-medium text-ink">United States</span>.
                  </span>
                ) : (
                  <span>
                    You&rsquo;re in {flagFor(detected)}{" "}
                    <span className="font-medium text-ink">{countryName(detected)}</span>. Showing listings from all
                    countries.
                  </span>
                )}
              </p>
            ) : null}

            <div className="mt-7 md:hidden">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Popular categories
              </h2>
              <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
                {categories.map((item) => (
                  <Link
                    key={item.slug}
                    href={browseHref(filters, { category: item.slug, q: "" })}
                    prefetch={false}
                    className={[
                      "flex w-16 shrink-0 flex-col items-center gap-2 text-center",
                      filters.category === item.slug ? "text-clay" : "text-ink-soft",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "grid h-16 w-16 place-items-center rounded-full text-2xl transition",
                        filters.category === item.slug ? "bg-accent-soft" : "bg-paper-2",
                      ].join(" ")}
                    >
                      {item.emoji}
                    </span>
                    <span className="line-clamp-2 text-[11px] font-medium leading-tight">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {filters.county ? (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <span>
                  Location: <span className="font-medium text-ink">{filters.county}</span>
                </span>
                <Link
                  href={browseHref(filters, { county: "" })}
                  className="rounded-full bg-paper-2 px-2.5 py-1 font-medium text-ink-soft transition hover:bg-accent-soft hover:text-ink"
                >
                  Clear state
                </Link>
              </p>
            ) : null}

            {filters.country ? (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <span>
                  Country:{" "}
                  <span className="font-medium text-ink">
                    {flagFor(filters.country)} {countryName(filters.country)}
                  </span>
                </span>
                <Link
                  href={browseHref(filters, { country: "" })}
                  className="rounded-full bg-paper-2 px-2.5 py-1 font-medium text-ink-soft transition hover:bg-accent-soft hover:text-ink"
                >
                  All countries
                </Link>
              </p>
            ) : null}
          </div>
        </section>

        <div id="categories" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
            <aside className="hidden lg:block">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-2 pr-1">
                <MarketplaceSidebar categories={categories} filters={filters} total={categoryTotal} priceOptions={priceOptions} />
              </div>
            </aside>

            <div className="min-w-0">
              {/* Keep price and sort controls compact on phones. */}
              <details className="mb-5 lg:hidden">
                <summary className="flex w-fit cursor-pointer list-none marker:hidden" aria-label="Filters">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-paper-2 text-ink-soft transition hover:bg-accent-soft hover:text-clay">
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M4 6h16M7 12h10M10 18h4" />
                    </svg>
                  </span>
                  <span className="sr-only">Filters</span>
                </summary>
                <div className="mt-3 rounded-2xl bg-paper-2/70 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {priceOptions.map((option) => (
                      <Link
                        key={option.value}
                        href={browseHref(filters, { max: filters.max === option.value ? undefined : option.value })}
                        className={[
                          "rounded-full px-3 py-1.5 text-xs font-medium transition",
                          filters.max === option.value
                            ? "bg-accent-soft text-ink"
                            : "bg-surface text-ink-soft hover:text-ink",
                        ].join(" ")}
                      >
                        {option.label}
                      </Link>
                    ))}
                    <SortSelect
                      value={filters.sort}
                      q={filters.q}
                      category={filters.category}
                      county={filters.county}
                      country={filters.country}
                      maxPrice={filters.max}
                    />
                  </div>
                </div>
              </details>

              {!filtered && featuredAds.length > 0 ? (
                <section id="recommended" className="scroll-mt-20">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Editor’s picks</p>
                      <h2 className="mt-1 text-2xl">Popular finds</h2>
                      <p className="mt-1 text-xs text-ink-soft">Listings buyers are discovering on Bazaar.</p>
                    </div>
                    <Link
                      href="/#trending"
                      className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-ink-soft transition hover:text-ink sm:inline-flex"
                    >
                      See all
                      <span className="transition group-hover:translate-x-0.5" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                    {featuredAds.map((product) => (
                      <MarketplaceCard key={product.slug} product={product} favorite={favoriteFor(product.slug)} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section id="trending" className={`scroll-mt-20 ${filtered ? "" : "mt-12"}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">
                      {filtered ? "Search results" : "Fresh listings"}
                    </p>
                    <h2 className="mt-1 text-2xl">{heading}</h2>
                    <p className="mt-1 text-xs text-ink-soft" aria-live="polite">
                      {pluralize(matchingProducts.length, "listing")}
                      {activeCategory ? ` in ${activeCategory.name}` : ""}
                      {filters.county ? ` from ${filters.county}` : ""}
                      {filters.country ? ` in ${countryName(filters.country)}` : ""}
                    </p>
                  </div>
                  {filtered ? (
                    <Link
                      href="/#trending"
                      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink"
                    >
                      Clear filters
                    </Link>
                  ) : null}
                </div>

                {!marketplaceEmpty ? (
                  <div className="mt-4 hidden gap-5 overflow-x-auto border-b border-line lg:flex">
                    <Tab href={browseHref(filters, { category: "" })} active={!filters.category}>
                      All
                    </Tab>
                    {categories.map((item) => (
                      <Tab
                        key={item.slug}
                        href={browseHref(filters, { category: item.slug })}
                        active={filters.category === item.slug}
                      >
                        {item.name}
                      </Tab>
                    ))}
                  </div>
                ) : null}

                {products.length > 0 ? (
                  <>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                      {products.map((product) => (
                        <MarketplaceCard key={product.slug} product={product} favorite={favoriteFor(product.slug)} />
                      ))}
                    </div>
                    <p className="mt-8 text-center text-xs text-ink-soft">
                      Showing {pageStart + 1}–{Math.min(pageStart + products.length, matchingProducts.length)} of {pluralize(matchingProducts.length, "listing")}
                    </p>
                    {totalPages > 1 ? (
                      <nav aria-label="Listing pages" className="mt-4 flex items-center justify-center gap-3">
                        {currentPage > 1 ? (
                          <Link
                            href={pageHref(filters, currentPage - 1)}
                            prefetch={false}
                            className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
                          >
                            Previous
                          </Link>
                        ) : null}
                        <span className="text-sm text-ink-soft" aria-current="page">
                          Page {currentPage} of {totalPages}
                        </span>
                        {currentPage < totalPages ? (
                          <Link
                            href={pageHref(filters, currentPage + 1)}
                            prefetch={false}
                            className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
                          >
                            Next
                          </Link>
                        ) : null}
                      </nav>
                    ) : null}
                  </>
                ) : marketplaceEmpty ? (
                  <div className="mt-6 rounded-xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
                    <p className="text-4xl" aria-hidden="true">
                      🏷️
                    </p>
                    <h3 className="mt-4 text-2xl">No listings yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                      Bazaar is brand new and the marketplace is empty. Be the first to list something — buyers can
                      message you directly.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                      <Link
                        href="/sell"
                        className="inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
                      >
                        List an item
                        <span aria-hidden="true">→</span>
                      </Link>
                      <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink"
                      >
                        Create an account
                      </Link>
                    </div>
                  </div>
                ) : countryEmpty ? (
                  <div className="mt-6 rounded-xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
                    <p className="text-4xl" aria-hidden="true">
                      {flagFor(filters.country)}
                    </p>
                    <h3 className="mt-4 text-2xl">No listings available</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                      No sellers in {countryName(filters.country)} have listed anything yet. Clear the country filter
                      to browse listings from other countries.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                      <Link
                        href={browseHref(filters, { country: "" })}
                        className="inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
                      >
                        Browse all listings
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
                    <p className="text-4xl" aria-hidden="true">
                      🔍
                    </p>
                    <h3 className="mt-4 text-2xl">Nothing here yet</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                      We couldn&rsquo;t find a match for{" "}
                      {filters.q ? <span className="font-medium text-ink">“{filters.q}”</span> : "those filters"}. Try a
                      broader search, or clear everything and start again.
                    </p>
                    <Link
                      href="/#trending"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
                    >
                      Clear filters
                    </Link>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* compact seller band */}
        <section id="sell" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-3xl bg-ink px-6 py-8 text-paper sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">For sellers</p>
              <h2 className="mt-1 text-2xl">Sell your things on Bazaar</h2>
              <p className="mt-1 text-sm text-paper/70">
                No listing fee · Talk with interested buyers directly through Bazaar.
              </p>
            </div>
            <Link
              href="/sell"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-clay px-6 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
            >
              Start selling
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
