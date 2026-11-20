import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import AppearanceSettings from "@/components/AppearanceSettings";
import ProfileForm from "@/components/ProfileForm";
import { getCurrentUser } from "@/lib/auth";
import { currencyForCountry } from "@/lib/currency";
import { countConversations, countReviewsByEmail, countUnreadConversations, listProducts, sellerSlug } from "@/lib/db";
import { listAllDurableProducts } from "@/lib/durable-products";
import { formatDate, formatPrice, initials } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Manage your Bazaar profile, country, state and contact details.",
};

const green = "#00831e";

type NavKind = "money" | "followers" | "adverts" | "feedback" | "faq" | "settings" | "appearance" | "messages" | "notifications";

function NavIcon({ kind }: { kind: NavKind }) {
  const paths: Record<NavKind, ReactNode> = {
    money: <path d="M12 3v18M16.5 7.5c-.9-1.1-2.5-1.7-4.5-1.7-2.6 0-4.5 1.2-4.5 3 0 4.2 9 1.8 9 6 0 1.8-1.9 3-4.5 3-2 0-3.6-.6-4.5-1.7" />,
    followers: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 5.5a3 3 0 0 1 0 5.4M17.5 14.5c2 .7 3.5 2.3 3.5 4.5" /></>,
    adverts: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    feedback: <><path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" /><path d="M8 9h8M8 12h5" /></>,
    faq: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8M12 16.5h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2.2 2.2-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21h-3.1v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1L4.5 17l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3v-3.1h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8L4.5 7 6.7 4.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3h3.1v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1L19.6 7l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.1V13h-.1a1.6 1.6 0 0 0-1.4 1Z" /></>,
    appearance: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    messages: <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4.6A8 8 0 0 1 13 4a8 8 0 0 1 8 8Z" />,
    notifications: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  };

  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[kind]}
    </svg>
  );
}

function SideLink({ href, kind, label, active = false, badge }: { href: string; kind: NavKind; label: string; active?: boolean; badge?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active ? "bg-[#00831e]/8 font-semibold text-[#007a1b]" : "text-ink-soft hover:bg-paper-2 hover:text-ink"
      }`}
    >
      <NavIcon kind={kind} />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold text-[#fff]">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-8 border-b border-line pb-3 font-display text-2xl font-semibold text-ink">
      {children}
    </h2>
  );
}

function MobileTile({ href, label, kind, badge }: { href: string; label: string; kind: NavKind; badge?: string }) {
  const tint: Partial<Record<NavKind, string>> = {
    adverts: "#e7f5ea",
    notifications: "#fdeaea",
    feedback: "#e7f0fb",
    faq: "#eff5e6",
  };
  const ink: Partial<Record<NavKind, string>> = {
    adverts: "#00831e",
    notifications: "#d93025",
    feedback: "#1769aa",
    faq: "#4b7a1f",
  };

  return (
    <Link
      href={href}
      className="relative flex min-h-[116px] flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(20,36,59,0.05)] transition active:scale-[0.98]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: tint[kind], color: ink[kind] }}>
        <NavIcon kind={kind} />
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-[#e53935] px-2 py-0.5 text-[11px] font-bold text-[#fff]">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/profile");

  const durable = (await listAllDurableProducts()).filter((product) => product.ownerId === String(user.id));
  const bySlug = new Map(listProducts({ seller: user.name, sort: "newest", imageMode: "cover" }).map((p) => [p.slug, p]));
  durable.forEach((product) => bySlug.set(product.slug, product));
  const listings = [...bySlug.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reviewCount = countReviewsByEmail(user.email);
  const conversationCount = countConversations(user.email);
  const unread = countUnreadConversations(user.email);
  const sellerLink = `/seller/${sellerSlug(user.name)}`;

  return (
    <>
      {/* Mobile profile: compact quick-action cards like the reference screenshot. */}
      <div className="lg:hidden">
        <header className="flex h-14 items-center justify-between border-b border-line bg-white px-4">
          <Link href="/" className="font-display text-lg font-bold text-[#00831e]">
            Bazaar
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#eaf1f8] text-ink"
          >
            <NavIcon kind="settings" />
          </Link>
        </header>
        <section className="bg-[#eaf1f8] px-4 pb-4 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <MobileTile href="/my-listings" label="My ads" kind="adverts" />
            <MobileTile
              href="/messages"
              label="Notifications"
              kind="notifications"
              badge={unread > 0 ? `+${Math.min(unread, 99)}` : undefined}
            />
            <MobileTile href="/settings#feedback" label="Feedback" kind="feedback" />
            <MobileTile href="/settings#faq" label="FAQ" kind="faq" />
          </div>
          <Link
            href="/settings"
            className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-ink shadow-[0_2px_10px_rgba(20,36,59,0.05)]"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7f0fb] text-[#1769aa]">
                <NavIcon kind="settings" />
              </span>
              Settings
            </span>
            <span aria-hidden="true" className="text-ink-soft">→</span>
          </Link>
        </section>
      </div>

      {/* Desktop profile uses the green marketplace bar from the reference. */}
      <div className="hidden lg:block">
        <header className="bg-[#00831e] text-[#fff]">
          <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link href="/" className="font-display text-[28px] font-bold leading-none tracking-tight">
              Bazaar
            </Link>
            <nav aria-label="Account navigation" className="flex items-center gap-5 text-sm font-semibold sm:gap-7">
              <Link href="/" className="transition hover:text-[#fff]/75">
                Browse listings
              </Link>
              <Link href="/messages" className="transition hover:text-[#fff]/75">
                Messages
              </Link>
            </nav>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-[1280px] bg-white lg:grid lg:min-h-[calc(100vh-72px)] lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="hidden border-b border-line px-5 py-8 sm:px-8 lg:block lg:min-h-[calc(100vh-72px)] lg:border-b-0 lg:border-r lg:px-9 lg:py-10">
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="grid h-[76px] w-[76px] place-items-center rounded-full text-2xl font-bold text-[#fff]"
              style={{ backgroundColor: user.avatarColor || green }}
            >
              {initials(user.name)}
            </span>
            <p className="mt-3.5 truncate font-display text-xl font-semibold text-ink">{user.name}</p>
            <p className="mt-0.5 max-w-full truncate text-xs text-ink-soft">{user.email}</p>
            <Link
              href="#profile-details"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md border px-4 text-[11px] font-bold uppercase tracking-[0.09em] transition"
              style={{ borderColor: green, color: green }}
            >
              {user.phone ? "Edit phone number" : "Add phone number"}
            </Link>
          </div>

          <nav aria-label="Profile sections" className="mt-9 space-y-1">
            <SideLink href="/sell" kind="money" label="Make money" />
            <SideLink href={sellerLink} kind="followers" label="Followers" />
            <SideLink href="#my-adverts" kind="adverts" label="My adverts" active />
            <SideLink href="#feedback" kind="feedback" label="Feedback" />
            <SideLink href="#faq" kind="faq" label="Frequently Asked Questions" />
            <div className="my-3 border-t border-line" />
            <SideLink href="#profile-details" kind="settings" label="Account settings" />
            <SideLink href="#appearance" kind="appearance" label="Appearance" />
            <SideLink href="/messages" kind="messages" label="Messages" badge={unread} />
          </nav>

          <div className="mt-8 border-t border-line pt-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">Your account</p>
            <p className="text-xs text-ink-soft">
              Member since {formatDate(user.createdAt)} · {countryLabel(user.country)}
            </p>
            <form action={signOutAction} className="mt-4">
              <button
                type="submit"
                className="h-10 w-full rounded-full border border-line bg-white text-sm font-semibold text-ink-soft transition hover:border-clay/40 hover:text-clay"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full text-[#fff]" style={{ backgroundColor: green }}>
              <NavIcon kind="settings" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: green }}>
              SETTINGS
            </p>
          </div>

          <section id="my-adverts" className="mt-8 scroll-mt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="border-b border-line pb-3">
                <h1 className="font-display text-3xl font-semibold leading-tight text-ink">My adverts</h1>
                {listings.length > 0 ? (
                  <p className="mt-1.5 text-sm text-ink-soft">
                    {listings.length} {listings.length === 1 ? "advert" : "adverts"} published.
                  </p>
                ) : null}
              </div>
              <Link
                href="/sell"
                className="inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-semibold text-[#fff] transition hover:brightness-110"
                style={{ backgroundColor: green }}
              >
                Create new one now!
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="mt-8 rounded-xl border border-line bg-paper-2/40 px-6 py-16 text-center">
                <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-2xl">
                  📦
                </span>
                <p className="mt-5 text-lg font-semibold text-ink">
                  There are no adverts yet.{" "}
                  <Link href="/sell" className="font-semibold hover:underline" style={{ color: green }}>
                    Create new one now!
                  </Link>
                </p>
              </div>
            ) : (
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {listings.map((product) => (
                  <li key={product.slug} className="flex gap-4 rounded-xl border border-line bg-white p-3 transition hover:border-[#00831e]/40">
                    <Link
                      href={`/listing/${product.slug}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-paper-2"
                      style={{ backgroundImage: `linear-gradient(135deg, ${product.tintFrom}, ${product.tintTo})` }}
                    >
                      {product.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-3xl">
                          {product.emoji}
                        </span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/listing/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-ink transition hover:text-[#007a1b]">
                        {product.title}
                      </Link>
                      <p className="mt-1 font-semibold tabular-nums" style={{ color: green }}>
                        {formatPrice(product.price, currencyForCountry(product.country))}
                      </p>
                      <p className="mt-1 truncate text-xs text-ink-soft">
                        {product.categoryName} · {product.condition} · {product.county}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-12">
            <SectionTitle id="profile-details">Account settings</SectionTitle>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Keep your name, country, state and phone number current so buyers know where you are.
            </p>
            <div id="profile-phone" className="mt-5 max-w-2xl scroll-mt-8">
              <ProfileForm user={user} />
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle id="feedback">Feedback</SectionTitle>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line p-5">
              <div>
                <p className="text-2xl font-semibold text-ink">{reviewCount}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{reviewCount === 1 ? "review written" : "reviews written"}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/messages" className="text-sm font-semibold hover:underline" style={{ color: green }}>
                  {unread > 0 ? `${unread} unread messages` : `${conversationCount} conversations`}
                </Link>
                <Link href={sellerLink} className="text-sm font-semibold hover:underline" style={{ color: green }}>
                  View seller page →
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle id="appearance">Appearance</SectionTitle>
            <p className="mt-3 text-sm text-ink-soft">Choose how Bazaar looks on this device.</p>
            <div className="mt-4 max-w-md">
              <AppearanceSettings />
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle id="faq">Frequently Asked Questions</SectionTitle>
            <div className="mt-4 max-w-3xl divide-y divide-line rounded-xl border border-line px-5">
              <details className="py-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">How do I publish an advert?</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Choose <Link href="/sell" className="font-semibold hover:underline" style={{ color: green }}>Make money</Link>, add a
                  title, price, location and up to five photos, then publish. Your advert goes live immediately.
                </p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">How do buyers contact me?</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Buyers message you through your Bazaar inbox, so your email address stays private. New conversations appear
                  with an unread count in the sidebar.
                </p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">Which currency will buyers see?</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Prices are shown in the currency of the country you choose for each advert. Changing your country on a new
                  advert switches its currency automatically.
                </p>
              </details>
              <details className="py-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">How do I arrange payment and pickup?</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Bazaar is a classifieds marketplace: you and the buyer agree on payment and handover directly in your
                  messages. Items saved to the cart are still arranged with each seller.
                </p>
              </details>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function countryLabel(code: string): string {
  return code ? code.toUpperCase() : "your area";
}
