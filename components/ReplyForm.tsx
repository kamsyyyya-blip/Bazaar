"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyAction, type MessageState } from "@/app/actions/messages";

export default function ReplyForm({ conversationId }: { conversationId: number }) {
  const [state, action, pending] = useActionState(replyAction, {} as MessageState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.sent && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="conversationId" value={conversationId} />

      <div>
        <label htmlFor="reply-body" className="sr-only">
          Reply to the seller
        </label>
        <textarea
          ref={textareaRef}
          id="reply-body"
          name="body"
          required
          minLength={2}
          maxLength={1200}
          rows={3}
          placeholder="Write a reply…"
          className="w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-sm leading-relaxed outline-none transition placeholder:text-ink-soft/60 focus:border-ink/35"
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-xl bg-clay/10 px-3.5 py-2.5 text-sm text-clay-dark">
          {state.error}
        </p>
      ) : null}
      {state.sent ? (
        <p role="status" aria-live="polite" className="text-xs text-olive">
          Sent.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">Keep the conversation in Bazaar so it&rsquo;s easy to find.</p>
        <button
          type="submit"
          disabled={pending}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:bg-clay disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reply"}
          {!pending ? <span aria-hidden="true">→</span> : null}
        </button>
      </div>
    </form>
  );
}
