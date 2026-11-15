import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReplyForm from "@/components/ReplyForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import {
  getConversation,
  getProduct,
  listMessages,
  markConversationRead,
} from "@/lib/db";
import { formatDateTime, formatPrice, initials } from "@/lib/format";
import { currencyForCountry } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Conversation",
  description: "Reply to a seller and keep your Bazaar messages in one place.",
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversationId = Number(id);
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent(`/messages/${id}`)}`);
  }

  if (!Number.isInteger(conversationId) || conversationId <= 0) notFound();
  const conversation = getConversation(conversationId, user.email);
  if (!conversation) notFound();

  markConversationRead(conversation.id, user.email);
  const messages = listMessages(conversation.id);
  const product = getProduct(conversation.productSlug);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/messages" className="transition hover:text-ink">
            Messages
          </Link>
          <span aria-hidden="true">/</span>
          <span className="max-w-[18rem] truncate text-ink">{conversation.productTitle}</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Conversation</p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-3xl">{conversation.seller}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              About “{conversation.productTitle}” · {messages.length} {messages.length === 1 ? "message" : "messages"}
            </p>
          </div>
          <Link
            href="/messages"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium transition hover:border-ink/25"
          >
            <span aria-hidden="true">←</span>
            All messages
          </Link>
        </div>

        {product ? (
          <Link
            href={`/listing/${product.slug}`}
            className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-ink/20 hover:shadow-soft"
          >
            <span
              aria-hidden="true"
              className="grid h-16 w-16 shrink-0 place-items-center rounded-xl text-3xl ring-1 ring-black/5"
              style={{
                backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})`,
              }}
            >
              {product.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{product.title}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">
                {formatPrice(product.price, currencyForCountry(product.country))} · {product.condition} · {product.county}
              </span>
            </span>
            <span aria-hidden="true" className="text-ink-soft">
              →
            </span>
          </Link>
        ) : null}

        <section aria-label="Messages" className="mt-6 rounded-2xl border border-line bg-paper-2/30 p-4 sm:p-6">
          <ol className="space-y-4">
            {messages.map((message) => {
              const mine = message.senderRole === "buyer";
              return (
                <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[88%] sm:max-w-[78%]">
                    <div className={`flex items-center gap-2 ${mine ? "justify-end" : ""}`}>
                      <span
                        aria-hidden="true"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[11px] font-semibold text-ink-soft ring-1 ring-line"
                      >
                        {initials(mine ? user.name : message.senderName)}
                      </span>
                      <span className="text-[12px] text-ink-soft">
                        {mine ? "You" : message.senderName} · {formatDateTime(message.createdAt)}
                      </span>
                    </div>
                    <div
                      className={[
                        "mt-1.5 whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        mine
                          ? "rounded-br-md bg-ink text-paper"
                          : "rounded-bl-md border border-line bg-white text-ink",
                      ].join(" ")}
                    >
                      {message.body}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 border-t border-line pt-5">
            <ReplyForm conversationId={conversation.id} />
          </div>
        </section>

        <p className="mt-4 text-center text-[12px] text-ink-soft">
          Demo inbox — the seller&rsquo;s first reply is simulated so you can see how messaging works.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
