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

// Set to true to restore the old mobile profile (account settings, feedback,
// appearance and FAQ all shown on the first profile screen).
const SHOW_OLD_MOBILE_PROFILE_SECTIONS = false;

type NavKind = "money" | "followers" | "adverts" | "cart" | "saved" | "feedback" | "faq" | "settings" | "appearance" | "messages";

function NavIcon({ kind }: { kind: NavKind }) {
  const paths: Record<NavKind, ReactNode> = {
    money: <path d="M12 3v18M16.5 7.5c-.9-1.1-2.5-1.7-4.5-1.7-2.6 0-4.5 1.2-4.5 3 0 4.2 9 1.8 9 6 0 1.8-1.9 3-4.5 3-2 0-3.6-.6-4.5-1.7" />,
    followers: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 5.5a3 3 0 0 1 0 5.4M17.5 14.5c2 .7 3.5 2.3 3.5 4.5" /></>,
    adverts: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M3 4h2.2l2.1 11.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" /></>,
    saved: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
    feedback: <><path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" /><path d="M8 9h8M8 12h5" /></>,
    faq: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8M12 16.5h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2.2 2.2-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21h-3.1v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1L4.5 17l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3v-3.1h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8L4.5 7 6.7 4.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3h3.1v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1L19.6 7l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.1V13h-.1a1.6 1.6 0 0 0-1.4 1Z" /></>,
    appearance: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    messages: <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4.6A8 8 0 0 1 13 4a8 8 0 0 1 8 8Z" />,
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
        active ? "bg-accent-soft font-medium text-ink" : "text-ink-soft hover:bg-paper hover:text-ink"
      }`}
    >
      <NavIcon kind={kind} />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold text-on-dark">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-8 border-b border-line pb-3 font-display text-xl font-semibold text-ink sm:text-2xl">
      {children}
    </h2>
  );
}

function MobileTile({ href, label, kind, badge }: { href: string; label: string; kind: NavKind; badge?: string }) {
  const tone: Partial<Record<NavKind, string>> = {
    adverts: "bg-accent-soft text-clay",
    cart: "bg-accent-soft text-clay",
    saved: "bg-accent-soft text-clay",
  };

  return (
    <Link
      href={href}
      className="relative flex min-h-[112px] flex-col justify-between rounded-xl border border-line bg-surface p-4 transition hover:border-clay/40 active:scale-[0.99]"
    >
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone[kind] ?? "bg-paper-2 text-ink"}`}>
        <NavIcon kind={kind} />
      </span>
      <span className="text-sm font-medium text-ink">{label}</span>
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-clay px-2 py-0.5 text-[11px] font-semibold text-on-dark">
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
  const profileDetailsClass = SHOW_OLD_MOBILE_PROFILE_SECTIONS ? "" : "hidden lg:block";

  return (
    <>
      {/* Mobile profile: compact quick-action cards like the reference screenshot. */}
      <div className="lg:hidden">
        <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-4">
          <Link href="/" aria-label="Bazaar home" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-sm font-semibold leading-none text-paper">
              b
            </span>
            <span className="text-lg font-semibold tracking-[-0.045em] text-ink">Bazaar</span>
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition hover:bg-paper-2"
          >
            <NavIcon kind="settings" />
          </Link>
        </header>
        <section className="bg-paper px-4 pb-5 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Your account</p>
          <p className="mt-2 font-display text-xl font-semibold text-ink">Manage your Bazaar activity</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MobileTile href="/my-listings" label="My ads" kind="adverts" />
            <MobileTile href="/cart" label="Cart" kind="cart" />
            <MobileTile
              href="/messages"
              label="Messages"
              kind="messages"
              badge={unread > 0 ? `+${Math.min(unread, 99)}` : undefined}
            />
            <MobileTile href="/favorites" label="Saved listings" kind="saved" />
            <MobileTile href="/settings#appearance" label="Appearance" kind="appearance" />
            <MobileTile href="/settings#feedback" label="Feedback" kind="feedback" />
            <MobileTile href="/settings#faq" label="FAQ" kind="faq" />
            <MobileTile href="/sell" label="Make money" kind="money" />
          </div>

          <Link
            href="/settings"
            className="mt-3 flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3.5 text-sm font-medium text-ink transition hover:border-clay/40"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-paper-2 text-ink">
                <NavIcon kind="settings" />
              </span>
              Settings
            </span>
            <span aria-hidden="true" className="text-ink-soft">→</span>
          </Link>
        </section>
      </div>

      {/* Desktop account header — paper and hairlines, no coloured bar. */}
      <div className="hidden lg:block">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link href="/" aria-label="Bazaar home" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-sm font-semibold leading-none text-paper">
                b
              </span>
              <span className="text-lg font-semibold tracking-[-0.045em] text-ink">Bazaar</span>
            </Link>
            <nav aria-label="Account navigation" className="flex items-center gap-6 text-sm font-medium text-ink-soft">
              <Link href="/" className="transition hover:text-clay">Browse listings</Link>
              <Link href="/favorites" className="transition hover:text-clay">Saved listings</Link>
              <Link href="/messages" className="transition hover:text-clay">Messages</Link>
              <Link href="/cart" className="transition hover:text-clay">Cart</Link>
              <Link href="/settings" className="transition hover:text-clay">Settings</Link>
            </nav>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-[1280px] bg-paper lg:grid lg:min-h-[calc(100vh-72px)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden border-b border-line bg-surface px-5 py-8 sm:px-8 lg:block lg:min-h-[calc(100vh-72px)] lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="grid h-[72px] w-[72px] place-items-center rounded-full text-xl font-semibold text-on-dark"
              style={{ backgroundColor: user.avatarColor || "var(--color-clay)" }}
            >
              {initials(user.name)}
            </span>
            <p className="mt-3.5 truncate font-display text-lg font-semibold text-ink">{user.name}</p>
            <p className="mt-0.5 max-w-full truncate text-xs text-ink-soft">{user.email}</p>
            <Link
              href="#profile-details"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-line bg-surface px-4 text-xs font-medium text-ink transition hover:border-clay/40 hover:text-clay"
            >
              {user.phone ? "Edit phone number" : "Add phone number"}
            </Link>
          </div>

          <nav aria-label="Profile sections" className="mt-9 space-y-1">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">Account</p>
            <SideLink href="#profile-details" kind="settings" label="Personal info" />
            <SideLink href="/settings" kind="settings" label="Settings" />
            <SideLink href="#appearance" kind="appearance" label="Appearance" />
            <SideLink href="/messages" kind="messages" label="Messages" badge={unread} />

            <div className="my-4 border-t border-line" />
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">Marketplace</p>
            <SideLink href="#my-adverts" kind="adverts" label="My adverts" active />
            <SideLink href="/cart" kind="cart" label="Cart" />
            <SideLink href="/favorites" kind="saved" label="Saved listings" />
            <SideLink href="/sell" kind="money" label="Make money" />
            <SideLink href={sellerLink} kind="followers" label="Followers" />
            <SideLink href="#feedback" kind="feedback" label="Feedback" />
            <SideLink href="#faq" kind="faq" label="Frequently Asked Questions" />
          </nav>

          <div className="mt-8 border-t border-line pt-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">Your account</p>
            <p className="px-3 text-xs leading-relaxed text-ink-soft">
              Member since {formatDate(user.createdAt)} · {countryLabel(user.country)}
            </p>
            <form action={signOutAction} className="mt-4">
              <button
                type="submit"
                className="h-10 w-full rounded-full border border-line bg-surface text-sm font-medium text-ink-soft transition hover:border-clay/40 hover:text-clay"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-clay" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Account overview</p>
          </div>

          <section id="my-adverts" className="mt-7 scroll-mt-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
              <div>
                <h1 className="font-display text-3xl font-semibold text-ink">My adverts</h1>
                {listings.length > 0 ? (
                  <p className="mt-2 text-sm text-ink-soft">
                    {listings.length} {listings.length === 1 ? "advert" : "adverts"} published.
                  </p>
                ) : null}
              </div>
              <Link
                href="/sell"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-clay px-5 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
              >
                Create new one now!
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="mt-6 rounded-xl border border-line bg-surface px-6 py-14 text-center">
                <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-paper-2 text-ink">
                  <NavIcon kind="adverts" />
                </span>
                <p className="mt-5 text-base font-medium text-ink">
                  There are no adverts yet.{" "}
                  <Link href="/sell" className="font-medium text-clay hover:underline">
                    Create new one now!
                  </Link>
                </p>
              </div>
            ) : (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {listings.map((product) => (
                  <li key={product.slug} className="flex gap-4 rounded-xl border border-line bg-surface p-3 transition hover:border-clay/40">
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
                      <Link href={`/listing/${product.slug}`} className="line-clamp-2 text-sm font-medium text-ink transition hover:text-clay-dark">
                        {product.title}
                      </Link>
                      <p className="mt-1 font-semibold tabular-nums text-clay">
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

          <div id="profile-details" className={`scroll-mt-8 ${profileDetailsClass}`}>
            <section className="mt-12">
              <SectionTitle id="account-settings-title">Account settings</SectionTitle>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Keep your name, country, state and phone number current so buyers know where you are.
              </p>
              <div id="profile-phone" className="mt-5 max-w-2xl scroll-mt-8 rounded-xl border border-line bg-surface p-5 sm:p-6">
                <ProfileForm user={user} />
              </div>
            </section>

            <section className="mt-12">
              <SectionTitle id="feedback">Feedback</SectionTitle>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5">
                <div>
                  <p className="text-2xl font-semibold text-ink">{reviewCount}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{reviewCount === 1 ? "review written" : "reviews written"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/messages" className="text-sm font-medium text-clay hover:underline">
                    {unread > 0 ? `${unread} unread messages` : `${conversationCount} conversations`}
                  </Link>
                  <Link href={sellerLink} className="text-sm font-medium text-clay hover:underline">
                    View seller page →
                  </Link>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <SectionTitle id="appearance">Appearance</SectionTitle>
              <p className="mt-3 text-sm text-ink-soft">Choose how Bazaar looks on this device.</p>
              <div className="mt-4 max-w-md rounded-xl border border-line bg-surface p-5">
                <AppearanceSettings />
              </div>
            </section>

            <section className="mt-12">
              <SectionTitle id="faq">Frequently Asked Questions</SectionTitle>
              <div className="mt-4 max-w-3xl divide-y divide-line rounded-xl border border-line bg-surface px-5">
                <details className="py-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink">How do I publish an advert?</summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Choose <Link href="/sell" className="font-medium text-clay hover:underline">Make money</Link>, add a
                    title, price, location and up to five photos, then publish. Your advert goes live immediately.
                  </p>
                </details>
                <details className="py-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink">How do buyers contact me?</summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Buyers message you through your Bazaar inbox, so your email address stays private. New conversations appear
                    with an unread count in the sidebar.
                  </p>
                </details>
                <details className="py-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink">Which currency will buyers see?</summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Prices are shown in the currency of the country you choose for each advert. Changing your country on a new
                    advert switches its currency automatically.
                  </p>
                </details>
                <details className="py-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink">How do I arrange payment and pickup?</summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Bazaar is a classifieds marketplace: you and the buyer agree on payment and handover directly in your
                    messages. Items saved to the cart are still arranged with each seller.
                  </p>
                </details>
              </div>
            </section>
          </div>

          <div className="mt-12 border-t border-line pt-5 lg:hidden">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">Your account</p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="h-11 w-full rounded-full border border-line bg-surface text-sm font-medium text-ink-soft transition hover:border-clay/40 hover:text-clay"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

function countryLabel(code: string): string {
  return code ? code.toUpperCase() : "your area";
}
