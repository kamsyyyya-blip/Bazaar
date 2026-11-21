"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addReviewAction, type ReviewState } from "@/app/actions/reviews";

type Props = {
  slug: string;
  signedIn: boolean;
  next?: string;
};

export default function ReviewForm({ slug, signedIn, next }: Props) {
  const [state, action, pending] = useActionState(addReviewAction, {} as ReviewState);

  if (!signedIn) {
    return (
      <div className="rounded-xl border border-line bg-surface px-5 py-6 text-center">
        <p className="text-sm leading-relaxed text-ink-soft">Bought something from this seller? Share how it went.</p>
        <Link
          href={`/signin?next=${encodeURIComponent(next ?? `/listing/${slug}`)}`}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-clay px-5 text-sm font-medium tracking-tight text-on-dark transition-colors hover:bg-clay-dark"
        >
          Sign in to write a review
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <input type="hidden" name="slug" value={slug} />
      <h3 className="text-lg">Write a review</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">Reviews are public and help other buyers in your area.</p>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Your rating</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={value}
                defaultChecked={value === 5}
                className="peer sr-only"
              />
              <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-sm font-medium text-ink-soft transition hover:border-clay hover:text-clay peer-checked:border-clay peer-checked:bg-clay peer-checked:text-on-dark peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay">
                {value}
              </span>
              <span className="sr-only">
                {value} star{value === 1 ? "" : "s"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="review-body" className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
          Your experience
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={3}
          minLength={12}
          maxLength={800}
          required
          placeholder="How was the item, the handover, the packing?"
          className="mt-2 w-full resize-y rounded-lg border border-line bg-paper/60 px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay"
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="mt-3 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" aria-live="polite" className="mt-3 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-clay">
          Thanks — your review is live.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-clay px-6 text-sm font-medium tracking-tight text-on-dark transition-colors hover:bg-clay-dark disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
