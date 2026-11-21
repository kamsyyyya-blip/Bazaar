"use client";

import { useEffect, useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import type { User } from "@/lib/db";

export default function SettingsAccountSection({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#personal-info" || window.location.hash === "#personal-info-panel") {
        setOpen(true);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (!open) return;
    const hash = window.location.hash;
    if (hash !== "#personal-info" && hash !== "#personal-info-panel") return;
    document.getElementById("personal-info-panel")?.scrollIntoView({ block: "start" });
  }, [open]);

  return (
    <>
      <button
        type="button"
        id="personal-info"
        aria-expanded={open}
        aria-controls="personal-info-panel"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-paper active:bg-paper-2"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-2 text-ink">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">Personal info</span>
        <span aria-hidden="true" className={`text-lg leading-none text-ink-soft transition ${open ? "rotate-90" : ""}`}>
          ›
        </span>
      </button>

      {open ? (
        <section id="personal-info-panel" className="scroll-mt-20 border-t border-line bg-paper/60 px-4 py-5 sm:px-5">
          <h2 className="font-display text-base font-semibold text-ink">Your personal info</h2>
          <p className="mt-1 text-sm text-ink-soft">Keep your contact and location details up to date.</p>

          <dl className="mt-4 grid gap-3 rounded-lg border border-line bg-surface p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-soft">Full name</dt>
              <dd className="mt-0.5 truncate font-semibold text-ink">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Email</dt>
              <dd className="mt-0.5 truncate font-semibold text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Phone</dt>
              <dd className="mt-0.5 font-semibold text-ink">{user.phone || "Not added"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Location</dt>
              <dd className="mt-0.5 font-semibold text-ink">
                {[user.county, user.country].filter(Boolean).join(", ") || "Not set"}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <ProfileForm user={user} />
          </div>
        </section>
      ) : null}
    </>
  );
}
