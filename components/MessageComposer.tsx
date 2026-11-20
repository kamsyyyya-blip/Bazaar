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
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      <QuickReplies onSelect={useQuickReply} />

      <div>
        <label htmlFor="message-body" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
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
          className="mt-1.5 w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed outline-none transition placeholder:text-ink-soft/60 focus:border-ink/35"
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-sm font-medium text-on-dark transition hover:bg-clay-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : "Send message"}
          {!pending ? <span aria-hidden="true">→</span> : null}
        </button>
        <p className="text-xs text-ink-soft">Replies stay in your Bazaar inbox.</p>
      </div>
    </form>
  );
}
