"use client";

import { useActionState, useRef, useState } from "react";
import { startConversationAction, type MessageState } from "@/app/actions/messages";
import QuickReplies from "@/components/QuickReplies";

export default function MessageComposer({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(startConversationAction, {} as MessageState);
  const [body, setBody] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function useQuickReply(text: string) {
    setBody(text);
    textareaRef.current?.focus();
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />

      <QuickReplies onSelect={useQuickReply} />

      <div>
        <label htmlFor="message-body" className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
          Your message
        </label>
        <textarea
          ref={textareaRef}
          id="message-body"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          minLength={2}
          maxLength={1200}
          rows={5}
          placeholder="Hi! Is this still available? Could I collect it this weekend?"
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-clay/50 focus:ring-4 focus:ring-accent-soft/40"
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col items-stretch gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-sm font-semibold text-on-dark transition hover:bg-clay-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : "Send message"}
          {!pending ? <span aria-hidden="true">→</span> : null}
        </button>
        <p className="text-xs text-ink-soft">Replies stay in your Bazaar inbox.</p>
      </div>
    </form>
  );
}
