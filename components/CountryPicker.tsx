"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  COUNTRIES,
  COUNTRY_PREVIEW_LIMIT,
  HOME_COUNTRY,
  POPULAR_COUNTRY_CODES,
  countryByCode,
  detectCountryFromNavigator,
  flagFor,
} from "@/lib/countries";
import type { SortKey } from "@/lib/filters";

type Props = {
  value: string;
  detected?: string;
  counts?: Record<string, number>;
  q?: string;
  category?: string;
  county?: string;
  maxPrice?: number;
  sort?: SortKey;
};

function detectFromNavigator(): string {
  return detectCountryFromNavigator();
}

export default function CountryPicker({
  value,
  detected = "",
  counts = {},
  q,
  category,
  county,
  maxPrice,
  sort,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [clientDetected, setClientDetected] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const local = detectFromNavigator();
    if (local && local !== detected) setClientDetected(local);
  }, [detected]);

  const guessed = detected || clientDetected;
  const selected = value ? countryByCode(value) : null;
  const guessedCountry = guessed ? countryByCode(guessed) : null;

  const preview = useMemo(() => {
    const codes = [guessed, ...POPULAR_COUNTRY_CODES].filter(Boolean) as string[];
    const unique = [...new Set(codes)]
      .map((code) => countryByCode(code))
      .filter((country): country is NonNullable<typeof country> => Boolean(country));
    return unique.slice(0, COUNTRY_PREVIEW_LIMIT);
  }, [guessed]);

  const guessedInPreview = preview.some((country) => country.code === guessed);
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return showAll ? COUNTRIES : preview;
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.code.toLowerCase() === normalizedQuery ||
        country.code.toLowerCase().startsWith(normalizedQuery),
    );
  }, [normalizedQuery, preview, showAll]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function choose(code: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (county && (!code || code === HOME_COUNTRY)) params.set("county", county);
    if (code) params.set("country", code);
    // A price cap only makes sense in the currency it was chosen in.
    if (maxPrice && code === value) params.set("max", String(maxPrice));
    if (sort && sort !== "featured") params.set("sort", sort);
    const search = params.toString();
    setOpen(false);
    setQuery("");
    setShowAll(false);
    router.push(`/${search ? `?${search}` : ""}#trending`);
  }

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-56">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country: ${selected ? selected.name : "all countries"}`}
        className="flex h-14 w-full items-center gap-2.5 rounded-2xl bg-paper-2 px-4 text-left text-ink transition hover:bg-accent-soft/60 sm:h-16"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {selected ? flagFor(selected.code) : "🌍"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {selected ? selected.name : "All countries"}
          </span>
          {!selected && guessedCountry ? (
            <span className="block truncate text-[11px] text-ink-soft">Near {guessedCountry.name}</span>
          ) : null}
        </span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="shrink-0 text-ink-soft"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
          <div className="border-b border-line p-2.5">
            <label htmlFor="country-search" className="sr-only">
              Search countries
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                id="country-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search all countries…"
                autoComplete="off"
                className="h-10 w-full rounded-xl border border-line bg-paper-2/50 pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-soft/60 focus:border-ink/35 focus:bg-surface"
              />
            </div>
          </div>

          <div
            role="listbox"
            aria-label="Countries"
            className="max-h-80 overflow-y-auto overscroll-contain p-1.5"
          >
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => choose("")}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                !value ? "bg-clay text-on-dark" : "hover:bg-paper-2",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-base">
                🌍
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">All countries</span>
              <span className={!value ? "text-[12px] text-on-dark/70" : "text-[12px] text-ink-soft"}>
                Global
              </span>
            </button>

            {!normalizedQuery && guessedCountry && guessed !== value && !guessedInPreview ? (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choose(guessed)}
                className="mt-1 flex w-full items-center gap-3 rounded-xl bg-accent-soft px-3 py-2 text-left text-sm transition hover:bg-accent-soft/70"
              >
                <span aria-hidden="true" className="text-base">
                  {flagFor(guessedCountry.code)}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-clay">
                    Detected
                  </span>
                  <span className="block truncate font-medium">{guessedCountry.name}</span>
                </span>
                <span className="text-[12px] text-ink-soft">{counts[guessedCountry.code] ?? 0}</span>
              </button>
            ) : null}

            {results.map((country) => {
              const count = counts[country.code] ?? 0;
              const active = country.code === value;
              return (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(country.code)}
                  className={[
                    "mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                    active ? "bg-clay text-on-dark" : "hover:bg-paper-2",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="text-base">
                    {flagFor(country.code)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  {count > 0 ? (
                    <span
                      className={
                        active ? "shrink-0 text-[12px] text-on-dark/70" : "shrink-0 text-[12px] text-ink-soft"
                      }
                    >
                      {count}
                    </span>
                  ) : null}
                  {active ? (
                    <span aria-hidden="true" className="text-xs text-on-dark">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}

            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-soft">
                No country matches “{query.trim()}”.
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line bg-paper-2/40 px-3 py-2 text-[12px] text-ink-soft">
            <span>
              {normalizedQuery
                ? `${results.length} ${results.length === 1 ? "country" : "countries"} match · all ${COUNTRIES.length} searchable`
                : showAll
                  ? `Showing all ${COUNTRIES.length} countries`
                  : `Showing ${preview.length} of ${COUNTRIES.length} countries`}
            </span>
            {!normalizedQuery ? (
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="shrink-0 font-medium text-ink underline-offset-2 transition hover:text-clay hover:underline"
              >
                {showAll ? "Show fewer" : "Show all"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
