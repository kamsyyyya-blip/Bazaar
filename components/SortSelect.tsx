"use client";

import { useRouter } from "next/navigation";

type Props = {
  value: string;
  q?: string;
  category?: string;
  county?: string;
  country?: string;
  maxPrice?: number;
};

const OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function SortSelect({ value, q, category, county, country, maxPrice }: Props) {
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (county) params.set("county", county);
    if (country) params.set("country", country);
    if (maxPrice) params.set("max", String(maxPrice));
    if (event.target.value !== "featured") params.set("sort", event.target.value);
    const search = params.toString();
    router.push(`/${search ? `?${search}` : ""}#trending`);
  }

  return (
    <label className="relative inline-flex items-center gap-2 text-sm text-ink-soft">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={value}
        onChange={handleChange}
        className="h-9 appearance-none rounded-full bg-surface pl-4 pr-9 text-sm font-medium text-ink outline-none transition hover:bg-paper-2"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="pointer-events-none absolute right-3.5 text-ink-soft"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
