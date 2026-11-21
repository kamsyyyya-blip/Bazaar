"use client";

import { useActionState, useEffect, useState } from "react";
import { signInAction, type AuthState } from "@/app/actions/auth";
import CountrySelect from "@/components/CountrySelect";
import StateSelect from "@/components/StateSelect";
import { HOME_COUNTRY, detectCountryFromNavigator } from "@/lib/countries";

type Props = {
  defaultCountry?: string;
  next?: string;
};

const field =
  "h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay/60";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft";

export default function SignInForm({ defaultCountry = "", next = "/profile" }: Props) {
  const [state, action, pending] = useActionState(signInAction, {} as AuthState);
  const [country, setCountry] = useState(defaultCountry || HOME_COUNTRY);
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  useEffect(() => {
    if (defaultCountry) return;
    const detected = detectCountryFromNavigator();
    if (detected) setCountry(detected);
  }, [defaultCountry]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="mode" value={mode} />

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-paper p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          aria-pressed={mode === "signin"}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "signin" ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          aria-pressed={mode === "signup"}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "signup" ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink"
          }`}
        >
          Create account
        </button>
      </div>

      <div>
        <label htmlFor="signin-email" className={labelClass}>
          Email address
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={`${field} mt-1.5`}
        />
      </div>

      {mode === "signup" ? (
        <>
          <div>
            <label htmlFor="signin-name" className={labelClass}>
              Full name
            </label>
            <input
              id="signin-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
              required
              minLength={2}
              maxLength={60}
              className={`${field} mt-1.5`}
            />
          </div>

          <div>
            <label htmlFor="signin-country" className={labelClass}>
              Country
            </label>
            <CountrySelect
              id="signin-country"
              name="country"
              value={country}
              onChange={setCountry}
              className={`${field} mt-1.5`}
            />
          </div>

          <div>
            <label htmlFor="signin-state" className={labelClass}>
              State / province
            </label>
            <StateSelect
              id="signin-state"
              name="county"
              country={country}
              className={`${field} mt-1.5`}
            />
          </div>
        </>
      ) : null}

      <div>
        <label htmlFor="signin-password" className={labelClass}>
          Password
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 12 : undefined}
          maxLength={128}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={`${field} mt-1.5`}
        />
        {mode === "signup" ? <p className="mt-1.5 text-xs text-ink-soft">Use at least 12 characters.</p> : null}
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" aria-live="polite" className="rounded-lg border border-clay/20 bg-accent-soft px-3.5 py-2.5 text-sm text-clay">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-full bg-clay px-6 text-sm font-medium text-on-dark transition hover:bg-clay-dark disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-xs leading-relaxed text-ink-soft">
        Your password is securely managed by Supabase. Never reuse a password from another account.
      </p>
    </form>
  );
}
