import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import AppearanceSettings from "@/components/AppearanceSettings";
import ProfileForm from "@/components/ProfileForm";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { countryName } from "@/lib/countries";
import { countConversations, countReviewsByEmail, countUnreadConversations } from "@/lib/db";
import { formatDate, initials } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Manage your Bazaar profile, country, state and contact details.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/profile");

  const reviewCount = countReviewsByEmail(user.email);
  const conversationCount = countConversations(user.email);
  const unread = countUnreadConversations(user.email);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Your profile</span>
        </nav>

        <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:mt-6 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Account</p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-4xl">Hi, {user.name.split(" ")[0]}.</h1>
            <p className="mt-2 text-sm text-ink-soft">
              Keep your details current so buyers and sellers know where you are.
            </p>
          </div>
          <Link
            href="/#trending"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium transition hover:border-ink/25 sm:w-auto"
          >
            Keep browsing
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section id="settings" className="scroll-mt-24 rounded-2xl border border-line bg-white p-4 sm:p-6 lg:p-7">
            <h2 className="font-display text-xl sm:text-2xl">Profile &amp; settings</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Your country and state are used to surface nearby listings and sellers.
            </p>
            <div className="mt-6">
              <ProfileForm user={user} />
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-6">
              <div className="flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-semibold text-paper"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {initials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-xl leading-tight">{user.name}</p>
                  <p className="truncate text-xs text-ink-soft">{user.email}</p>
                </div>
              </div>

              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Country</dt>
                  <dd className="text-right font-medium">{countryName(user.country)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">State / province</dt>
                  <dd className="text-right font-medium">{user.county || "Not set"}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Member since</dt>
                  <dd className="text-right font-medium">{formatDate(user.createdAt)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Reviews written</dt>
                  <dd className="text-right font-medium">{reviewCount}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Messages</dt>
                  <dd className="text-right font-medium">
                    <Link href="/messages" className="underline-offset-4 hover:underline">
                      {unread > 0 ? `${unread} unread` : `${conversationCount} conversations`}
                    </Link>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-soft">Phone</dt>
                  <dd className="text-right font-medium">{user.phone || "Not set"}</dd>
                </div>
              </dl>

              <form action={signOutAction} className="mt-6">
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center rounded-full border border-line bg-white text-sm font-medium text-ink-soft transition hover:border-clay/40 hover:text-clay"
                >
                  Sign out
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="font-medium">Appearance</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Choose how Bazaar looks on this device. System follows your OS setting.
              </p>
              <div className="mt-3">
                <AppearanceSettings />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Your messages</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {unread > 0
                      ? `${unread} unread ${unread === 1 ? "conversation" : "conversations"} waiting.`
                      : conversationCount > 0
                        ? `${conversationCount} ${conversationCount === 1 ? "conversation" : "conversations"} with sellers.`
                        : "Ask sellers about condition, pickup or price."}
                  </p>
                </div>
                <span aria-hidden="true" className="text-2xl">
                  💬
                </span>
              </div>
              <Link href="/messages" className="mt-3 inline-flex text-xs font-medium text-clay hover:text-clay-dark">
                Open inbox →
              </Link>
            </div>

            <div className="rounded-2xl border border-line bg-paper-2/50 p-5 text-sm">
              <p className="font-medium">Selling something?</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                List it in your area and reach buyers nearby. No listing fees for the first 90 days.
              </p>
              <Link href="/sell" className="mt-3 inline-flex text-xs font-medium text-clay hover:text-clay-dark">
                Start selling →
              </Link>
            </div>
          </aside>
        </div>
      </main>

    </>
  );
}
