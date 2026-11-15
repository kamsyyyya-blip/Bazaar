import { currencyDigits, fromMinorUnits } from "./currency";

/**
 * Formats a listing price from stored minor units into the listing's own
 * currency (USD cents, NGN kobo, JPY yen and so on). Drops decimals when the
 * amount is whole.
 */
export function formatPrice(minor: number, currency = "USD"): string {
  const digits = currencyDigits(currency);
  const amount = fromMinorUnits(minor, currency);
  const hasFraction = Math.abs(amount % 1) > 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: hasFraction ? digits : 0,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
  }
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}

/** Formats ISO dates (YYYY-MM-DD or full ISO) for display. */
export function formatDate(value: string): string {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Formats a full timestamp with a short month, day and time. */
export function formatDateTime(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "B";
}
