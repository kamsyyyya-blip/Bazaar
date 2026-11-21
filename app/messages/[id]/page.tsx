import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReplyForm from "@/components/ReplyForm";
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
import { getDurableProduct } from "@/lib/durable-products";

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
  const product = await getDurableProduct(conversation.productSlug) ?? getProduct(conversation.productSlug);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Conversation</p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-3xl">{conversation.seller}</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              About “{conversation.productTitle}” · {messages.length} {messages.length === 1 ? "message" : "messages"}
            </p>
          </div>
          <Link
            href="/messages"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition hover:border-ink/25"
          >
            <span aria-hidden="true">←</span>
            All messages
          </Link>
        </div>

        {product ? (
          <Link
            href={`/listing/${product.slug}`}
            className="group mt-7 flex items-center gap-3 border-y border-line py-4 transition sm:gap-4"
          >
            <span
              aria-hidden="true"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-3xl ring-1 ring-line/70 sm:h-16 sm:w-16"
              style={{
                backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})`,
              }}
            >
              {product.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{product.title}</span>
              <span className="mt-0.5 block truncate text-xs text-ink-soft">
                {formatPrice(product.price, currencyForCountry(product.country))} · {product.condition} · {product.county}
              </span>
            </span>
            <span aria-hidden="true" className="text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-ink">
              →
            </span>
          </Link>
        ) : null}

        <section aria-label="Messages" className="mt-8">
          <ol className="space-y-6">
            {messages.map((message) => {
              const mine = message.senderRole === "buyer";
              return (
                <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[94%] sm:max-w-[80%]">
                    <div className={`flex items-center gap-2 ${mine ? "justify-end" : ""}`}>
                      <span
                        aria-hidden="true"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold text-ink-soft ring-1 ring-line"
                      >
                        {initials(mine ? user.name : message.senderName)}
                      </span>
                      <span className="text-[11px] leading-tight text-ink-soft sm:text-xs">
                        {mine ? "You" : message.senderName} · {formatDateTime(message.createdAt)}
                      </span>
                    </div>
                    <div
                      className={[
                        "mt-2 whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        mine
                          ? "rounded-br-md bg-clay text-on-dark"
                          : "rounded-bl-md border border-line bg-surface text-ink",
                      ].join(" ")}
                    >
                      {message.body}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-9 border-t border-line pt-6">
            <ReplyForm conversationId={conversation.id} />
          </div>
        </section>

        <p className="mt-6 text-center text-[12px] text-ink-soft">
          Demo inbox — the seller&rsquo;s first reply is simulated so you can see how messaging works.
        </p>
      </main>
    </>
  );
}
