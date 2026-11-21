"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";

export default function FavoriteButton({
  slug,
  signedIn,
  initiallySaved,
  overlay = false,
}: {
  slug: string;
  signedIn: boolean;
  initiallySaved: boolean;
  overlay?: boolean;
}) {
  const [state, action, pending] = useActionState(toggleFavoriteAction, {});
  const saved = state.saved ?? initiallySaved;
  const overlayClass = "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-ink shadow-soft backdrop-blur transition hover:scale-105 hover:bg-surface disabled:opacity-60";
  const buttonClass = overlay
    ? overlayClass
    : "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink transition hover:bg-accent-soft hover:text-clay disabled:opacity-60";

  if (!signedIn) {
    return (
      <Link
        href={`/signin?next=${encodeURIComponent(`/listing/${slug}`)}`}
        aria-label="Sign in to save listing"
        title="Save listing"
        className={buttonClass}
      >
        <Heart filled={false} />
      </Link>
    );
  }

  return (
    <div className={overlay ? "contents" : "flex flex-col items-center gap-1"}>
      <form action={action}>
        <input type="hidden" name="slug" value={slug} />
        <button
          type="submit"
          disabled={pending}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved listings" : "Save listing"}
          title={saved ? "Remove from saved listings" : "Save listing"}
          className={buttonClass}
        >
          <Heart filled={saved} saved={saved} />
        </button>
      </form>
      {!overlay && state.error ? (
        <span role="alert" className="max-w-28 text-center text-[11px] text-danger">{state.error}</span>
      ) : null}
    </div>
  );
}

function Heart({ filled, saved = false }: { filled: boolean; saved?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={saved ? "text-clay" : undefined}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}
