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
  getStats,
  listCategories,
  listCountryCounts,
  listFeatured,
  listProducts,
} from "@/lib/db";
import { browseHref, hasActiveFilters, parseFilters, priceFilters } from "@/lib/filters";
import { currencyForCountry } from "@/lib/currency";
import { pluralize } from "@/lib/format";
import { detectCountry } from "@/lib/geo";

export const dynamic = "force-dynamic";

function chipClass(active: boolean): string {
  return [
    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition",
    active ? "bg-ink text-paper" : "border border-line bg-white text-ink-soft hover:border-ink/25 hover:text-ink",
  ].join(" ");
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
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
  const filters = parseFilters(await searchParams);
  const detected = await detectCountry();
  const currency = currencyForCountry(filters.country || detected || HOME_COUNTRY);
  const priceOptions = priceFilters(currency);
  const categories = listCategories(filters.county, filters.country);
  const countryCounts = Object.fromEntries(
    listCountryCounts().map((country) => [country.code, country.count]),
  ) as Record<string, number>;
  const stats = getStats();
  const featured = listFeatured(4);
  const products = listProducts({ ...filters, maxPrice: filters.max });
  const categoryTotal = categories.reduce((total, category) => total + category.count, 0);
  const countryEmpty = Boolean(filters.country) && (countryCounts[filters.country] ?? 0) === 0;
  const marketplaceEmpty = stats.products === 0;

  const activeCategory = categories.find((item) => item.slug === filters.category);
  const filtered = hasActiveFilters(filters);
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
            : "Trending now";

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
        {/* compact search band — no hero */}
        <section className="border-b border-line/70 bg-paper-2/40">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <h1 className="text-3xl leading-tight sm:text-4xl">What are you looking for today?</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              {marketplaceEmpty ? (
                <>No listings yet — be the first to sell something in your area. It takes about a minute.</>
              ) : countryEmpty ? (
                <>
                  No listings in {countryName(filters.country)} yet. Try another country, or be the first to list
                  something here.
                </>
              ) : (
                <>
                  {pluralize(stats.products, "fresh listing")} from {pluralize(stats.makers, "local seller")} across{" "}
                  {pluralize(stats.counties, "state")}. Search the whole market, or pick a category.
                </>
              )}
            </p>

            <div className="mt-5 flex max-w-5xl flex-col gap-2.5 lg:flex-row">
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

            <div className="mt-5">
              <h2 className="mb-3 text-sm font-semibold text-ink">Popular categories</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 xl:grid-cols-8">
                {categories.map((item) => (
                  <Link
                    key={item.slug}
                    href={browseHref(filters, { category: item.slug, q: "" })}
                    className="group flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white px-2 py-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-soft focus-visible:outline-offset-2"
                  >
                    <span aria-hidden="true" className="text-2xl leading-none transition-transform group-hover:scale-110">
                      {item.emoji}
                    </span>
                    <span className="line-clamp-2 text-xs font-semibold leading-tight text-ink-soft group-hover:text-ink">
                      {item.name}
                    </span>
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
                  className="rounded-full border border-line bg-white px-2.5 py-1 font-medium transition hover:border-ink/25 hover:text-ink"
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
                  className="rounded-full border border-line bg-white px-2.5 py-1 font-medium transition hover:border-ink/25 hover:text-ink"
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
              {/* Keep the category and price controls compact on phones. */}
              <details className="mb-6 rounded-xl border border-line bg-white lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink marker:hidden">
                  <span>Categories &amp; filters</span>
                  <svg aria-hidden="true" className="shrink-0 transition-transform [details[open]_&]:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="border-t border-line px-3 py-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Category</p>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                  <Link href={browseHref(filters, { category: "" })} className={chipClass(!filters.category)}>
                    All
                  </Link>
                  {categories.map((item) => (
                    <Link
                      key={item.slug}
                      href={browseHref(filters, { category: item.slug })}
                      className={chipClass(filters.category === item.slug)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Filters</p>
                <div className="flex flex-wrap items-center gap-2">
                  {priceOptions.map((option) => (
                    <Link
                      key={option.value}
                      href={browseHref(filters, { max: filters.max === option.value ? undefined : option.value })}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        filters.max === option.value
                          ? "border-ink/30 bg-ink/5 text-ink"
                          : "border-line bg-white text-ink-soft hover:border-ink/25 hover:text-ink",
                      ].join(" ")}
                    >
                      {option.label}
                    </Link>
                  ))}
                  <span className="mx-0.5 hidden h-5 w-px bg-line sm:block" />
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

              {!filtered && !marketplaceEmpty ? (
                <section id="recommended" className="scroll-mt-20">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl">Recommended for you</h2>
                      <p className="mt-1 text-xs text-ink-soft">Hand-picked listings our editors are watching this week.</p>
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

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {featured.map((product) => (
                      <MarketplaceCard key={product.slug} product={product} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section id="trending" className={`scroll-mt-20 ${filtered ? "" : "mt-12"}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl">{heading}</h2>
                    <p className="mt-1 text-xs text-ink-soft" aria-live="polite">
                      {pluralize(products.length, "listing")}
                      {activeCategory ? ` in ${activeCategory.name}` : ""}
                      {filters.county ? ` from ${filters.county}` : ""}
                      {filters.country ? ` in ${countryName(filters.country)}` : ""}
                    </p>
                  </div>
                  {filtered ? (
                    <Link
                      href="/#trending"
                      className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink"
                    >
                      Clear filters
                    </Link>
                  ) : null}
                </div>

                {!marketplaceEmpty ? (
                  <div className="mt-4 flex gap-5 overflow-x-auto border-b border-line">
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
                        <MarketplaceCard key={product.slug} product={product} />
                      ))}
                    </div>
                    <p className="mt-8 text-center text-xs text-ink-soft">
                      You&rsquo;ve reached the end · {pluralize(products.length, "listing")}
                    </p>
                  </>
                ) : marketplaceEmpty ? (
                  <div className="mt-6 rounded-xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
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
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-clay"
                      >
                        List an item
                        <span aria-hidden="true">→</span>
                      </Link>
                      <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink"
                      >
                        Create an account
                      </Link>
                    </div>
                  </div>
                ) : countryEmpty ? (
                  <div className="mt-6 rounded-xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
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
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-clay"
                      >
                        Browse all listings
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
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
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-clay"
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
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-clay">For sellers</p>
              <h2 className="mt-1 text-2xl">Sell your things on Bazaar</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Keep 92% of every sale · No listing fees for 90 days · We handle payments and labels.
              </p>
            </div>
            <Link
              href="/sell"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper transition hover:bg-clay"
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
