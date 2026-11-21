"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SortKey } from "@/lib/filters";

type Props = {
  defaultValue?: string;
  category?: string;
  county?: string;
  country?: string;
  max?: number;
  sort?: SortKey;
  compact?: boolean;
};

export default function SearchForm({
  defaultValue = "",
  category = "",
  county = "",
  country = "",
  max,
  sort,
  compact = false,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const q = value.trim();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (county) params.set("county", county);
    if (country) params.set("country", country);
    if (max) params.set("max", String(max));
    if (sort && sort !== "featured") params.set("sort", sort);
    const search = params.toString();
    router.push(`/${search ? `?${search}` : ""}#trending`);
  }

  return (
    <form
      role="search"
      action="/"
      method="get"
      onSubmit={handleSubmit}
      className={[
        "relative flex w-full items-center",
        compact
          ? "h-10 rounded-full bg-paper-2 focus-within:bg-surface"
          : "h-14 rounded-2xl bg-paper-2 focus-within:bg-surface sm:h-16",
      ].join(" ")}
    >
      <span
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/60"
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>

      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={compact ? "Search Bazaar" : "Search phones, bikes, sofas, vinyl…"}
        aria-label="Search listings"
        autoComplete="off"
        className={[
          "h-full w-full bg-transparent outline-none placeholder:text-ink-soft/60",
          compact ? "pl-10 pr-10 text-sm" : "pl-12 pr-32 text-[16px]",
        ].join(" ")}
      />

      {category ? <input type="hidden" name="category" value={category} /> : null}
      {county ? <input type="hidden" name="county" value={county} /> : null}
      {country ? <input type="hidden" name="country" value={country} /> : null}
      {max ? <input type="hidden" name="max" value={max} /> : null}
      {sort && sort !== "featured" ? <input type="hidden" name="sort" value={sort} /> : null}

      <button
        type="submit"
        className={[
          "absolute top-1/2 -translate-y-1/2 rounded-xl bg-clay text-on-dark transition hover:bg-clay-dark",
          compact
            ? "right-1 grid h-8 w-8 place-items-center"
            : "right-2 h-10 px-5 text-sm font-medium sm:h-12 sm:px-6",
        ].join(" ")}
        aria-label={compact ? "Search" : undefined}
      >
        {compact ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        ) : (
          <span className="inline-flex items-center gap-2">
            Search
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
