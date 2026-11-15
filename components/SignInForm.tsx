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
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition placeholder:text-ink-soft/60 focus:border-ink/35";

export default function SignInForm({ defaultCountry = "", next = "/profile" }: Props) {
  const [state, action, pending] = useActionState(signInAction, {} as AuthState);
  const [country, setCountry] = useState(defaultCountry || HOME_COUNTRY);

  useEffect(() => {
    if (defaultCountry) return;
    const detected = detectCountryFromNavigator();
    if (detected) setCountry(detected);
  }, [defaultCountry]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="signin-email" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
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

      <div>
        <label htmlFor="signin-name" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
          Full name
        </label>
        <input
          id="signin-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          className={`${field} mt-1.5`}
        />
        <p className="mt-1.5 text-xs text-ink-soft">Only needed the first time — it&rsquo;s the name sellers will see.</p>
      </div>

      <div>
        <label htmlFor="signin-country" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
          Country
        </label>
        <CountrySelect
          id="signin-country"
          name="country"
          value={country}
          onChange={setCountry}
          className={`${field} mt-1.5`}
        />
        <p className="mt-1.5 text-xs text-ink-soft">Detected from your browser — change it if needed.</p>
      </div>

      <div>
        <label htmlFor="signin-state" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
          State / province
        </label>
        <StateSelect
          id="signin-state"
          name="county"
          country={country}
          className={`${field} mt-1.5`}
        />
        <p className="mt-1.5 text-xs text-ink-soft">Shown on your profile so buyers know your region.</p>
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-xl bg-clay/10 px-3.5 py-2.5 text-sm text-clay-dark">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-paper transition hover:bg-clay disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Continue"}
      </button>

      <p className="text-center text-xs leading-relaxed text-ink-soft">
        Demo sign-in — no password required. A new account is created automatically the first time you continue.
      </p>
    </form>
  );
}
