import { headers } from "next/headers";
import { isCountryCode } from "./countries";

const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-geo-country",
  "x-client-country",
] as const;

function normalize(value: string | null | undefined): string {
  const code = (value ?? "").trim().toUpperCase();
  return code.length === 2 && isCountryCode(code) ? code : "";
}

/**
 * Best-effort country detection from the request edge/CDN headers. Returns an
 * empty string when the host does not provide a country, so the client can try
 * `navigator.language` as a fallback.
 */
export async function detectCountry(): Promise<string> {
  const requestHeaders = await headers();

  for (const name of COUNTRY_HEADERS) {
    const code = normalize(requestHeaders.get(name));
    if (code) return code;
  }

  return "";
}
