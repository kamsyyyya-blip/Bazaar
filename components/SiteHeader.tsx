import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { countCartItems, countProductsBySeller, countUnreadConversations, sellerSlug } from "@/lib/db";
import type { SortKey } from "@/lib/filters";
import SearchForm from "./SearchForm";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "B";
}

export default async function SiteHeader({
  query = "",
  county = "",
  country = "",
  max,
  sort,
}: {
  query?: string;
  county?: string;
  country?: string;
  max?: number;
  sort?: SortKey;
}) {
  const user = await getCurrentUser();
  const unread = user ? countUnreadConversations(user.email) : 0;
  const published = user ? countProductsBySeller(user.name) : 0;
  const cartCount = user ? countCartItems(user.email) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-display text-lg text-paper">
            b
          </span>
          <span className="font-display text-xl tracking-tight">Bazaar</span>
        </Link>

        <div className="hidden max-w-md flex-1 md:block">
          <SearchForm compact defaultValue={query} county={county} country={country} max={max} sort={sort} />
        </div>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Cart (${cartCount} item${cartCount === 1 ? "" : "s"})` : "Cart"}
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink sm:flex sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-2"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-paper sm:static sm:h-5 sm:min-w-5 sm:text-[11px]">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/sell"
            aria-label="Start selling"
            title="Start selling"
            className="hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition hover:border-ink/40 hover:bg-white sm:grid"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </Link>

          {user ? (
            <Link
              href={published > 0 ? `/seller/${sellerSlug(user.name)}` : "/sell"}
              aria-label={
                published > 0
                  ? `Your listings (${published} published)`
                  : "You have no published listings"
              }
              title={
                published > 0
                  ? `${published} published ${published === 1 ? "listing" : "listings"}`
                  : "No published listings yet"
              }
              className="relative flex items-center gap-1.5 rounded-full px-2.5 py-2 text-ink-soft transition hover:bg-paper-2 hover:text-ink"
            >
              <svg
                aria-hidden="true"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8Z"
                  strokeLinejoin="round"
                />
                <circle cx="7.5" cy="7.5" r="1.2" />
              </svg>
              <span className={published > 0 ? "inline" : "hidden"}>{published}</span>
              {published > 0 ? (
                <span className="sr-only">{published === 1 ? "published listing" : "published listings"}</span>
              ) : null}
            </Link>
          ) : null}

          <Link
            href="/messages"
            className="relative ml-1 hidden items-center gap-1.5 rounded-full px-2.5 py-2 text-ink-soft transition hover:bg-paper-2 hover:text-ink sm:flex"
            aria-label={`Messages${unread > 0 ? ` (${unread} unread)` : ""}`}
          >
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4.6A8 8 0 0 1 13 4a8 8 0 0 1 8 8Z" strokeLinejoin="round" />
              <path d="M9 11h8M9 14.5h5" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Messages</span>
            {unread > 0 ? (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold leading-none text-paper">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>

          {user ? (
            <Link
              href="/profile"
              className="ml-1 flex items-center gap-2 rounded-full border border-ink/15 py-1 pl-1 pr-2 transition hover:border-ink/40 hover:bg-white sm:pr-3"
              title={`Signed in as ${user.name}`}
            >
              <span
                aria-hidden="true"
                className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-paper"
                style={{ backgroundColor: user.avatarColor }}
              >
                {initials(user.name)}
              </span>
              <span className="hidden max-w-[7rem] truncate sm:inline">{user.name.split(" ")[0]}</span>
              <span className="sr-only">Your profile</span>
            </Link>
          ) : (
            <Link
              href="/signin"
              className="ml-1 rounded-full bg-ink px-4 py-2 font-medium text-paper transition hover:bg-clay"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
