import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { countUnreadConversations, listConversations } from "@/lib/db";
import { formatDateTime, initials, pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Messages",
  description: "Keep every conversation with Bazaar sellers in one place.",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/messages")}`);

  const conversations = listConversations(user.email);
  const unread = countUnreadConversations(user.email);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Messages</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Inbox</p>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">Your messages</h1>
            <p className="mt-2 text-sm text-ink-soft">
              {conversations.length === 0
                ? "Conversations with sellers will appear here."
                : `${pluralize(conversations.length, "conversation")}${unread > 0 ? ` · ${unread} unread` : " · all caught up"}`}
            </p>
          </div>
          <Link
            href="/#trending"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium transition hover:border-ink/25"
          >
            Find something to ask about
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-label="Conversations">
            {conversations.length > 0 ? (
              <ul className="space-y-3">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      href={`/messages/${conversation.id}`}
                      className="group flex gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-ink/20 hover:shadow-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-2xl ring-1 ring-black/5"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${conversation.productTintFrom}, ${conversation.productTintTo})`,
                        }}
                      >
                        {conversation.productEmoji}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">{conversation.productTitle}</span>
                              {conversation.unread > 0 ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-clay px-1.5 py-0.5 text-[11px] font-semibold text-paper">
                                  {conversation.unread} new
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-ink-soft">
                              with {conversation.seller}
                            </span>
                          </span>
                          <span className="shrink-0 text-[12px] text-ink-soft">
                            {formatDateTime(conversation.lastMessageAt)}
                          </span>
                        </span>

                        <span className="mt-2 block truncate text-sm text-ink-soft">
                          {conversation.lastMessage || "Start the conversation"}
                        </span>
                      </span>

                      <span
                        aria-hidden="true"
                        className="self-center text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-ink"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
                <p className="text-4xl" aria-hidden="true">
                  💬
                </p>
                <h2 className="mt-4 text-2xl">No messages yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                  Found something you like? Open the seller&apos;s page and choose “Message seller” to ask about
                  condition, pickup or price.
                </p>
                <Link
                  href="/#trending"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-clay"
                >
                  Browse listings
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-paper"
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
                  <dd className="font-medium">{conversations.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Unread</dt>
                  <dd className={unread > 0 ? "font-medium text-clay" : "font-medium"}>{unread}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-line bg-paper-2/50 p-5 text-sm">
              <p className="font-medium">Messaging safety</p>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-ink-soft">
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
