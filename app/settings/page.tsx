import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import AppearanceSettings from "@/components/AppearanceSettings";
import SettingsAccountSection from "@/components/SettingsAccountSection";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { countReviewsByEmail, countUnreadConversations, sellerSlug } from "@/lib/db";
import { initials } from "@/lib/format";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Bazaar account, contact details and preferences.",
};

type Tone = "green" | "red" | "blue" | "dark";
type IconKind = "user" | "case" | "globe" | "phone" | "mail" | "chat" | "feedback" | "bell" | "info" | "star" | "lock";

const toneColor: Record<Tone, string> = {
  green: "var(--color-clay)",
  red: "var(--color-danger)",
  blue: "var(--color-ink-soft)",
  dark: "var(--color-footer)",
};

function Icon({ kind }: { kind: IconKind }) {
  const common = {
    "aria-hidden": true as const,
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "case":
      return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></svg>;
    case "globe":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z" /></svg>;
    case "phone":
      return <svg {...common}><path d="M6 3h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2Z" /></svg>;
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
    case "chat":
      return <svg {...common}><path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" /><path d="M8 9h8M8 12h5" /></svg>;
    case "feedback":
      return <svg {...common}><path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" /><path d="M9 10h.01M15 10h.01M9 13h6" /></svg>;
    case "bell":
      return <svg {...common}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
    case "info":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
    case "star":
      return <svg {...common}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" /></svg>;
    case "lock":
      return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
  }
}

function SettingsRow({
  id,
  icon,
  tone,
  label,
  value,
  href,
}: {
  id?: string;
  icon: IconKind;
  tone: Tone;
  label: string;
  value?: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-on-dark" style={{ backgroundColor: toneColor[tone] }}>
        <Icon kind={icon} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{label}</span>
      {value ? <span className="max-w-[45%] truncate text-xs text-ink-soft">{value}</span> : null}
      {href ? <span aria-hidden="true" className="text-lg leading-none text-ink-soft">›</span> : null}
    </>
  );

  const className = "flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left transition";
  if (href) {
    return (
      <Link id={id} href={href} className={`${className} hover:bg-paper-2/60 active:bg-paper-2`}>
        {content}
      </Link>
    );
  }
  return (
    <div id={id} className={className}>
      {content}
    </div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-line border-y border-line bg-surface">{children}</div>;
}

function Gap() {
  return <div className="h-2 bg-paper-2" aria-hidden="true" />;
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/settings");

  const reviewCount = countReviewsByEmail(user.email);
  const unread = countUnreadConversations(user.email);
  const sellerLink = `/seller/${sellerSlug(user.name)}`;

  return (
    <div className="min-h-screen bg-paper-2 pb-28 lg:bg-surface lg:pb-16">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href="/profile" aria-label="Back to profile" className="grid h-9 w-9 place-items-center rounded-full text-xl text-ink">
            <span aria-hidden="true">‹</span>
          </Link>
          <h1 className="font-display text-lg font-semibold text-ink">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl">
        <section className="flex items-center gap-3 bg-surface px-4 py-5">
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-on-dark"
            style={{ backgroundColor: user.avatarColor || "var(--color-clay)" }}
          >
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-soft">{user.email}</p>
          </div>
        </section>

        <Gap />

        <section id="appearance" className="scroll-mt-16 bg-surface px-4 py-5">
          <h2 className="font-display text-lg font-semibold text-ink">Appearance</h2>
          <p className="mt-1 text-sm text-ink-soft">Choose how Bazaar looks on this device.</p>
          <div className="mt-4">
            <AppearanceSettings />
          </div>
        </section>

        <Gap />

        <Group>
          <SettingsAccountSection user={user} />
          <SettingsRow icon="case" tone="green" label="Business info" href={sellerLink} />
        </Group>

        <Gap />

        <Group>
          <SettingsRow icon="globe" tone="green" label="Change language" value="English" />
          <SettingsRow icon="phone" tone="red" label="Phone numbers" value={user.phone ? "Added" : "Add"} href="#personal-info-panel" />
          <SettingsRow icon="mail" tone="red" label="Change e-mail" value={user.email} href="#personal-info-panel" />
        </Group>

        <Gap />

        <Group>
          <SettingsRow icon="chat" tone="blue" label="Disable chats" value="Enabled" href="/messages" />
          <SettingsRow icon="feedback" tone="blue" label="Disable feedback" value="Enabled" href="#feedback" />
          <SettingsRow icon="bell" tone="blue" label="Manage notifications" value={unread > 0 ? `${unread} unread` : undefined} href="/messages" />
        </Group>

        <Gap />

        <Group>
          <SettingsRow icon="info" tone="dark" label="About Bazaar" />
          <SettingsRow icon="star" tone="dark" label="Rate us" />
          <SettingsRow icon="lock" tone="dark" label="Change password" />
        </Group>

        <Gap />

        <section id="feedback" className="scroll-mt-16 bg-surface px-4 py-5">
          <h2 className="font-display text-lg font-semibold text-ink">Feedback</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {reviewCount === 0 ? "No feedback yet." : `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} written.`}
          </p>
          <Link href={sellerLink} className="mt-3 inline-flex text-sm font-semibold text-clay hover:underline">
            View seller page →
          </Link>
        </section>

        <Gap />

        <section id="faq" className="scroll-mt-16 bg-surface px-4 py-5">
          <h2 className="font-display text-lg font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-3 divide-y divide-line">
            <details className="py-3">
              <summary className="cursor-pointer text-sm font-semibold text-ink">How do I publish an advert?</summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Choose Sell, add a title, price, location and up to five photos, then publish. Your advert goes live immediately.
              </p>
            </details>
            <details className="py-3">
              <summary className="cursor-pointer text-sm font-semibold text-ink">How do buyers contact me?</summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Buyers message you through your Bazaar inbox, so your email address stays private.
              </p>
            </details>
            <details className="py-3">
              <summary className="cursor-pointer text-sm font-semibold text-ink">Which currency will buyers see?</summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Prices are shown in the currency of the country you choose for each advert.
              </p>
            </details>
          </div>
        </section>

        <Gap />

        <div className="bg-surface px-4 py-5">
          <form action={signOutAction}>
            <button
              type="submit"
              className="h-11 w-full rounded-full border border-line text-sm font-semibold text-danger transition hover:border-danger/40 hover:bg-danger/5"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
