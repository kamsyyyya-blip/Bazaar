import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { countUnreadConversations, listConversations, type Conversation } from "@/lib/db";
import { formatDateTime, initials, pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Messages",
  description: "Keep every conversation with Bazaar sellers in one place.",
};

type Filter = "all" | "unread" | "unanswered";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "unanswered", label: "Unanswered" },
];

function filterHref(filter: Filter, query: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filter !== "all") params.set("filter", filter);
  const search = params.toString();
  return `/messages${search ? `?${search}` : ""}`;
}

function matchesSearch(conversation: Conversation, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return [conversation.productTitle, conversation.seller, conversation.lastMessage].some((value) =>
    value.toLowerCase().includes(needle),
  );
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/messages")}`);

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const requestedFilter = typeof params.filter === "string" ? params.filter : "all";
  const filter: Filter =
    requestedFilter === "unread" || requestedFilter === "unanswered" ? requestedFilter : "all";

  const allConversations = listConversations(user.email);
  const unread = countUnreadConversations(user.email);
  const searchMatches = allConversations.filter((conversation) => matchesSearch(conversation, query));

  const counts: Record<Filter, number> = {
    all: searchMatches.length,
    unread: searchMatches.filter((conversation) => conversation.unread > 0).length,
    unanswered: searchMatches.filter((conversation) => conversation.lastSenderRole === "seller").length,
  };

  const conversations = searchMatches.filter((conversation) => {
    if (filter === "unread") return conversation.unread > 0;
    if (filter === "unanswered") return conversation.lastSenderRole === "seller";
    return true;
  });
  const hasFilters = filter !== "all" || query.length > 0;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-16 lg:pt-12">
        <div className="hidden flex-col items-start justify-between gap-3 lg:flex lg:flex-row lg:items-end lg:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Inbox</p>
            <h1 className="mt-2 text-3xl sm:text-4xl">Your messages</h1>
            <p className="mt-2 text-sm text-ink-soft">
              {allConversations.length === 0
                ? "Conversations with sellers will appear here."
                : `${pluralize(conversations.length, "conversation")}${hasFilters ? " shown" : ""}${
                    unread > 0 ? ` · ${unread} unread` : " · all caught up"
                  }`}
            </p>
          </div>
          <Link
            href="/#trending"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition hover:border-ink/25"
          >
            Find something to ask about
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <section aria-label="Message tools" className="mt-4 lg:mt-9">
          <form action="/messages" method="get" role="search" className="relative">
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
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
              defaultValue={query}
              placeholder="Search in Messages"
              aria-label="Search in messages"
              autoComplete="off"
              className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-clay/50 focus:ring-4 focus:ring-accent-soft/50"
            />
            {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
            <button type="submit" className="sr-only">
              Search messages
            </button>
          </form>

          <nav aria-label="Filter messages" className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {FILTERS.map((item) => {
              const active = filter === item.value;
              return (
                <Link
                  key={item.value}
                  href={filterHref(item.value, query)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition sm:h-10 sm:flex-none sm:px-5",
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-surface text-ink-soft hover:border-ink/30 hover:text-ink",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  {counts[item.value] > 0 ? (
                    <span
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                        active ? "bg-white/15 text-paper" : "bg-paper-2 text-ink-soft",
                      ].join(" ")}
                    >
                      {counts[item.value]}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </section>

        <div className="mt-5 grid gap-6 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <section aria-label="Conversations">
            {conversations.length > 0 ? (
              <ul className="divide-y divide-line border-y border-line">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      href={`/messages/${conversation.id}`}
                      className="group flex items-start gap-3 px-1 py-4 transition hover:bg-surface/80 sm:gap-4 sm:px-3"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ring-1 ring-line/70 sm:h-14 sm:w-14"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${conversation.productTintFrom}, ${conversation.productTintTo})`,
                        }}
                      >
                        {conversation.productEmoji}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-sm font-semibold">{conversation.productTitle}</span>
                              {conversation.unread > 0 ? (
                                <span className="inline-flex shrink-0 items-center rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-clay">
                                  {conversation.unread} new
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-ink-soft">
                              with {conversation.seller}
                            </span>
                          </span>
                          <span className="shrink-0 text-[11px] text-ink-soft sm:text-xs">
                            {formatDateTime(conversation.lastMessageAt)}
                          </span>
                        </span>

                        <span className="mt-1.5 block truncate text-sm text-ink-soft">
                          {conversation.lastMessage || "Start the conversation"}
                        </span>
                      </span>

                      <span
                        aria-hidden="true"
                        className="hidden self-center text-sm text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-ink sm:block"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-y border-line px-6 py-14 text-center sm:py-20">
                <p className="text-4xl" aria-hidden="true">
                  💬
                </p>
                <h2 className="mt-4 text-2xl">{hasFilters ? "No matching messages" : "No messages yet"}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                  {hasFilters
                    ? "Try a different search or switch to another filter."
                    : "Found something you like? Open the seller’s page and choose “Message seller” to ask about condition, pickup or price."}
                </p>
                {hasFilters ? (
                  <Link
                    href="/messages"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
                  >
                    Clear filters
                  </Link>
                ) : (
                  <Link
                    href="/#trending"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
                  >
                    Browse listings
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            )}
          </section>

          <aside className="hidden space-y-7 lg:block">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-on-dark"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {initials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-ink-soft">{user.email}</p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Conversations</dt>
                  <dd className="font-medium">{allConversations.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Unread</dt>
                  <dd className={unread > 0 ? "font-medium text-clay" : "font-medium"}>{unread}</dd>
                </div>
              </dl>
            </div>

            <div className="px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Messaging safety</p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-soft">
                <li>Keep payments on Bazaar so both sides are covered.</li>
                <li>Meet in a public place for local pickups.</li>
                <li>Never share bank details or one-time codes.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
