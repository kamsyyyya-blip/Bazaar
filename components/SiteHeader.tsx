import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { countUnreadConversations } from "@/lib/db";
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

  return (
    <header className="sticky top-0 z-50 border-b-0 border-line bg-paper/90 backdrop-blur-md lg:border-b">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Bazaar home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-sm font-semibold leading-none text-paper">
            b
          </span>
          <span className="text-base font-semibold tracking-[-0.045em] text-ink sm:text-lg">Bazaar</span>
        </Link>

        <div className="min-w-0 flex-1 md:hidden">
          <SearchForm compact defaultValue={query} county={county} country={country} max={max} sort={sort} />
        </div>

        <div className="hidden max-w-lg flex-1 md:block">
          <SearchForm compact defaultValue={query} county={county} country={country} max={max} sort={sort} />
        </div>

        <nav className="ml-auto hidden items-center gap-0.5 md:flex md:gap-1.5" aria-label="Account navigation">
          {user ? (
            <Link
              href="/favorites"
              aria-label={`Saved listings${user.favorites?.length ? ` (${user.favorites.length})` : ""}`}
              title="Saved listings"
              className="hidden h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink sm:grid"
            >
              <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
              </svg>
            </Link>
          ) : null}

          <Link
            href="/messages"
            aria-label={`Messages${unread > 0 ? ` (${unread} unread)` : ""}`}
            title="Messages"
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink"
          >
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4.6A8 8 0 0 1 13 4a8 8 0 0 1 8 8Z" strokeLinejoin="round" />
              <path d="M9 11h8M9 14.5h5" strokeLinecap="round" />
            </svg>
            {unread > 0 ? (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] font-semibold leading-none text-on-dark">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>

          {user ? (
            <Link
              href="/profile"
              className="ml-0.5 flex items-center gap-2 rounded-full bg-paper-2 py-1 pl-1 pr-2 transition hover:bg-accent-soft sm:px-3"
              title={`Signed in as ${user.name}`}
              aria-label="Your profile"
            >
              <span
                aria-hidden="true"
                className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-on-dark"
                style={{ backgroundColor: user.avatarColor }}
              >
                {initials(user.name)}
              </span>
              <span className="hidden max-w-[7rem] truncate text-sm sm:inline">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/signin"
              className="ml-0.5 rounded-full bg-paper-2 px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-soft"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/sell"
            className="ml-1 hidden h-10 items-center rounded-full bg-clay px-5 text-sm font-medium text-on-dark transition hover:bg-clay-dark sm:inline-flex"
          >
            Sell
          </Link>
        </nav>
      </div>
    </header>
  );
}
