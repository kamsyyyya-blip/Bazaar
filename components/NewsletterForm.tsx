"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <p className="flex h-11 items-center gap-2 text-sm text-on-dark/80" role="status">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-clay text-[12px] text-on-dark">✓</span>
        You&rsquo;re on the list — see you Friday.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
      }}
      className="flex h-11 w-full items-center gap-2 rounded-full border border-on-dark/20 bg-on-dark/10 p-1 pl-4 focus-within:border-on-dark/40"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent text-sm text-on-dark outline-none placeholder:text-on-dark/55"
      />
      <button
        type="submit"
        className="h-9 shrink-0 rounded-full bg-clay px-4 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
      >
        Join
      </button>
    </form>
  );
}
