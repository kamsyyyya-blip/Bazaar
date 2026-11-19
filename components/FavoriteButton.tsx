"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";

export default function FavoriteButton({
  slug,
  signedIn,
  initiallySaved,
}: {
  slug: string;
  signedIn: boolean;
  initiallySaved: boolean;
}) {
  const [state, action, pending] = useActionState(toggleFavoriteAction, {});
  const saved = state.saved ?? initiallySaved;

  if (!signedIn) {
    return (
      <Link
        href={`/signin?next=${encodeURIComponent(`/listing/${slug}`)}`}
        aria-label="Sign in to save listing"
        title="Save listing"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink/30"
      >
        <Heart filled={false} />
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <form action={action}>
        <input type="hidden" name="slug" value={slug} />
        <button
          type="submit"
          disabled={pending}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved listings" : "Save listing"}
          title={saved ? "Remove from saved listings" : "Save listing"}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink/30 disabled:opacity-60"
        >
          <Heart filled={saved} />
        </button>
      </form>
      {state.error ? <span role="alert" className="max-w-28 text-center text-[11px] text-clay-dark">{state.error}</span> : null}
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}
