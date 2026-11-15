import { formatPrice } from "./format";
import { toMinorUnits } from "./currency";

export const SORT_KEYS = ["featured", "price-asc", "price-desc", "rating", "newest"] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

/** Tier caps in major units. Currencies with large nominal values get own tiers. */
const PRICE_TIERS: Record<string, number[]> = {
  NGN: [10_000, 25_000, 50_000, 100_000],
  INR: [1_000, 2_500, 5_000, 10_000],
  JPY: [1_000, 5_000, 10_000, 50_000],
  KRW: [10_000, 50_000, 100_000, 500_000],
  IDR: [100_000, 250_000, 500_000, 1_000_000],
  VND: [100_000, 500_000, 1_000_000, 5_000_000],
  PKR: [5_000, 10_000, 25_000, 50_000],
  PHP: [1_000, 5_000, 10_000, 25_000],
  KES: [1_000, 5_000, 10_000, 25_000],
  GHS: [100, 250, 500, 1_000],
  ZAR: [100, 250, 500, 1_000],
};

const DEFAULT_PRICE_TIERS = [50, 100, 250, 500];

/** Price filter options expressed in the active country's currency. */
export function priceFilters(currency: string): { value: number; label: string }[] {
  const tiers = PRICE_TIERS[currency.toUpperCase()] ?? DEFAULT_PRICE_TIERS;
  return tiers.map((amount) => {
    const value = toMinorUnits(amount, currency);
    return { value, label: `Under ${formatPrice(value, currency)}` };
  });
}

export const CONDITIONS = ["Brand new", "Like new", "Good", "Fair", "For parts"] as const;

export type Filters = {
  q: string;
  category: string;
  county: string;
  country: string;
  sort: SortKey;
  max?: number;
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const sortParam = first(params.sort);
  return {
    q: first(params.q),
    category: first(params.category),
    county: first(params.county),
    country: first(params.country).toUpperCase(),
    sort: SORT_KEYS.includes(sortParam as SortKey) ? (sortParam as SortKey) : "featured",
    max: Number(first(params.max)) || undefined,
  };
}

/** Builds a URL for the listings section, preserving every filter that is not overridden. */
export function browseHref(current: Filters, patch: Partial<Filters> = {}): string {
  const next: Filters = { ...current, ...patch };
  const search = new URLSearchParams();
  if (next.q) search.set("q", next.q);
  if (next.category) search.set("category", next.category);
  if (next.county) search.set("county", next.county);
  if (next.country) search.set("country", next.country);
  if (next.max) search.set("max", String(next.max));
  if (next.sort && next.sort !== "featured") search.set("sort", next.sort);
  const query = search.toString();
  return `/${query ? `?${query}` : ""}#trending`;
}

export function hasActiveFilters(filters: Filters): boolean {
  return Boolean(
    filters.q ||
      filters.category ||
      filters.county ||
      filters.country ||
      filters.max ||
      filters.sort !== "featured",
  );
}
