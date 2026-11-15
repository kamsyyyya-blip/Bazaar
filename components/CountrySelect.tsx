"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, countryByCode, flagFor } from "@/lib/countries";

type Props = {
  id?: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (code: string) => void;
  className?: string;
  /** Adds an empty “Not set” option for optional fields. */
  optional?: boolean;
};

/**
 * Searchable country picker backed by the full ISO 3166-1 list. The whole list
 * is available immediately and can be filtered by name or code. A hidden input
 * carries the selected code so plain form submissions keep working.
 */
export default function CountrySelect({
  id,
  name,
  defaultValue = "",
  value,
  onChange,
  className = "",
  optional = false,
}: Props) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const selectedCode = controlled ? value : internal;
  const selected = selectedCode ? countryByCode(selectedCode) : null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return COUNTRIES;
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(term) ||
        country.code.toLowerCase() === term ||
        country.code.toLowerCase().startsWith(term),
    );
  }, [query]);

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
    if (!controlled) setInternal(code);
    onChange?.(code);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={selectedCode} />

      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country: ${selected ? selected.name : optional ? "not set" : "choose a country"}`}
        className={`${className} flex items-center justify-between gap-2 text-left`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="text-base leading-none">
            {selected ? flagFor(selected.code) : "🌍"}
          </span>
          <span className={`truncate ${selected ? "" : "text-ink-soft/70"}`}>
            {selected ? selected.name : optional ? "Not set" : "Choose a country"}
          </span>
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
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-line bg-white shadow-lift">
          <div className="border-b border-line p-2">
            <label htmlFor={`${id ?? name}-country-search`} className="sr-only">
              Search countries
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                id={`${id ?? name}-country-search`}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search all ${COUNTRIES.length} countries…`}
                autoComplete="off"
                className="h-9 w-full rounded-lg border border-line bg-paper-2/50 pl-8 pr-2.5 text-sm outline-none transition placeholder:text-ink-soft/60 focus:border-ink/35 focus:bg-white"
              />
            </div>
          </div>

          <ul role="listbox" aria-label="Countries" className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
            {optional ? (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!selectedCode}
                  onClick={() => choose("")}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
                    !selectedCode ? "bg-ink text-paper" : "hover:bg-paper-2",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="text-base">
                    🌍
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">Not set</span>
                </button>
              </li>
            ) : null}

            {results.map((country) => {
              const active = country.code === selectedCode;
              return (
                <li key={country.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(country.code)}
                    className={[
                      "mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
                      active ? "bg-ink text-paper" : "hover:bg-paper-2",
                    ].join(" ")}
                  >
                    <span aria-hidden="true" className="text-base leading-none">
                      {flagFor(country.code)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{country.name}</span>
                    {active ? (
                      <span aria-hidden="true" className="text-xs text-paper">
                        ✓
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}

            {results.length === 0 ? (
              <li className="px-2.5 py-6 text-center text-sm text-ink-soft">
                No country matches “{query.trim()}”.
              </li>
            ) : null}
          </ul>

          <p className="border-t border-line bg-paper-2/40 px-3 py-1.5 text-[12px] text-ink-soft">
            {query.trim()
              ? `${results.length} of ${COUNTRIES.length} countries match`
              : `All ${COUNTRIES.length} countries · type to filter`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
