import countryToCurrency from "country-to-currency";

const FALLBACK_CURRENCY = "USD";

const BY_COUNTRY = countryToCurrency as unknown as Record<string, string>;
const digitCache = new Map<string, number>();
const symbolCache = new Map<string, string>();
const nameCache = new Map<string, string>();

/** ISO 4217 currency used by a country, e.g. NG → NGN, GB → GBP. */
export function currencyForCountry(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  return BY_COUNTRY[code] ?? FALLBACK_CURRENCY;
}

/** Number of decimal places a currency uses (JPY 0, USD 2, KWD 3). */
export function currencyDigits(currency: string): number {
  const code = currency.trim().toUpperCase();
  const cached = digitCache.get(code);
  if (cached !== undefined) return cached;

  let digits = 2;
  try {
    digits =
      new Intl.NumberFormat("en-US", { style: "currency", currency: code }).resolvedOptions()
        .maximumFractionDigits ?? 2;
  } catch {
    digits = 2;
  }
  digitCache.set(code, digits);
  return digits;
}

/** Converts a major-unit amount (e.g. 1200.50) into stored minor units. */
export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * 10 ** currencyDigits(currency));
}

/** Converts stored minor units back into a major-unit amount. */
export function fromMinorUnits(minor: number, currency: string): number {
  return minor / 10 ** currencyDigits(currency);
}

/** Short symbol used inside price inputs, e.g. ₦, $, €, CHF. */
export function currencySymbol(currency: string): string {
  const code = currency.trim().toUpperCase();
  const cached = symbolCache.get(code);
  if (cached) return cached;

  let symbol = code;
  try {
    const parts = new Intl.NumberFormat("en-US", { style: "currency", currency: code }).formatToParts(0);
    symbol = parts.find((part) => part.type === "currency")?.value ?? code;
  } catch {
    symbol = code;
  }
  symbolCache.set(code, symbol);
  return symbol;
}

/** Human currency name, e.g. “Nigerian Naira”. Falls back to the code. */
export function currencyName(currency: string): string {
  const code = currency.trim().toUpperCase();
  const cached = nameCache.get(code);
  if (cached) return cached;

  let name = code;
  try {
    name = new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code;
  } catch {
    name = code;
  }
  nameCache.set(code, name);
  return name;
}
