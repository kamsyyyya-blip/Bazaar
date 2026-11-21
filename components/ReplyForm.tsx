"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { replyAction, type MessageState } from "@/app/actions/messages";
import QuickReplies from "@/components/QuickReplies";

export default function ReplyForm({ conversationId }: { conversationId: number }) {
  const [state, action, pending] = useActionState(replyAction, {} as MessageState);
  const [body, setBody] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.sent) {
      setBody("");
      textareaRef.current?.focus();
    }
  }, [state]);

  function useQuickReply(text: string) {
    setBody(text);
    textareaRef.current?.focus();
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="conversationId" value={conversationId} />

      <QuickReplies onSelect={useQuickReply} />

      <div>
        <label htmlFor="reply-body" className="sr-only">
          Reply to the seller
        </label>
        <textarea
          ref={textareaRef}
          id="reply-body"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          minLength={2}
          maxLength={1200}
          rows={3}
          placeholder="Write a reply…"
          className="min-h-28 w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-clay/50 focus:ring-4 focus:ring-accent-soft/40"
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.sent ? (
        <p role="status" aria-live="polite" className="text-xs font-medium text-clay">
          Sent.
        </p>
      ) : null}

      <div className="flex flex-col items-stretch justify-between gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
        <p className="text-xs text-ink-soft">Keep the conversation in Bazaar so it&rsquo;s easy to find.</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-clay px-5 text-sm font-semibold text-on-dark transition hover:bg-clay-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : "Send reply"}
          {!pending ? <span aria-hidden="true">→</span> : null}
        </button>
      </div>
    </form>
  );
}
