"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileState } from "@/app/actions/auth";
import CountrySelect from "@/components/CountrySelect";
import StateSelect from "@/components/StateSelect";
import type { User } from "@/lib/db";

type Props = {
  user: User;
};

const field =
  "h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay/60 disabled:bg-paper-2/60 disabled:text-ink-soft";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft";

export default function ProfileForm({ user }: Props) {
  const [state, action, pending] = useActionState(updateProfileAction, {} as ProfileState);
  const [country, setCountry] = useState(user.country);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Full name
          </label>
          <input
            id="profile-name"
            name="name"
            defaultValue={user.name}
            required
            minLength={2}
            maxLength={60}
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <label htmlFor="profile-email" className={labelClass}>
            Email
          </label>
          <input id="profile-email" value={user.email} disabled className={`${field} mt-1.5`} />
          <p className="mt-1.5 text-xs text-ink-soft">Email is used to sign in and can&rsquo;t be changed in the demo.</p>
        </div>

        <div>
          <label htmlFor="profile-country" className={labelClass}>
            Country
          </label>
          <CountrySelect
            id="profile-country"
            name="country"
            value={country}
            onChange={setCountry}
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <label htmlFor="profile-county" className={labelClass}>
            State / province
          </label>
          <StateSelect
            id="profile-county"
            name="county"
            country={country}
            defaultValue={user.county}
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <label htmlFor="profile-phone" className={labelClass}>
            Phone <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            defaultValue={user.phone}
            autoComplete="tel"
            placeholder="(555) 010-2030"
            className={`${field} mt-1.5`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile-bio" className={labelClass}>
          About you
        </label>
        <textarea
          id="profile-bio"
          name="bio"
          defaultValue={user.bio}
          rows={4}
          maxLength={280}
          placeholder="Tell buyers what you collect, sell or are hunting for."
          className="mt-1.5 w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay/60"
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" aria-live="polite" className="rounded-lg border border-clay/20 bg-accent-soft px-3.5 py-2.5 text-sm text-clay">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center rounded-full bg-clay px-6 text-sm font-medium text-on-dark transition hover:bg-clay-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <p className="text-xs text-ink-soft">Your state or province powers nearby search results.</p>
      </div>
    </form>
  );
}
