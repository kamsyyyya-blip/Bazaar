import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignInForm from "@/components/SignInForm";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { detectCountry } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Bazaar to message sellers, save your country and leave reviews.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNext(rawNext, "/profile");

  const user = await getCurrentUser();
  if (user) redirect(next);

  const defaultCountry = await detectCountry();
  const nextLabel = next.startsWith("/messages")
    ? "your messages"
    : next === "/sell"
      ? "sell an item"
      : next.startsWith("/profile")
        ? "your profile"
        : "";

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-20">
          <section className="rise">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Welcome to Bazaar</p>
            <h1 className="mt-4 max-w-xl text-4xl sm:text-5xl">Sign in to buy and sell locally.</h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
              Create an account to save your location, message sellers and leave reviews. Sign in securely with your email
              and password.
            </p>

            <ul className="mt-10 divide-y divide-line border-y border-line text-sm text-ink-soft">
              {[
                "Set your country so the right listings surface first.",
                "Message sellers and keep the conversation in one place.",
                "Review items you have bought and help your neighbours.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 py-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-clay"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-ink-soft">
              Just browsing?{" "}
              <Link
                href="/#trending"
                className="font-medium text-ink underline decoration-line underline-offset-4 transition hover:text-clay hover:decoration-clay"
              >
                Keep exploring the marketplace
              </Link>
              .
            </p>
          </section>

          <section className="rise rise-2 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-8">
            {nextLabel ? (
              <p className="mb-5 rounded-lg border border-line bg-paper px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
                Sign in to continue to <span className="font-medium text-ink">{nextLabel}</span>. After signing in, you’ll
                return to that page.
              </p>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Account access</p>
            <h2 className="mt-2 font-display text-2xl">Sign in or create an account</h2>
            <p className="mt-1.5 text-xs text-ink-soft">Sign in to an existing account or create a new one.</p>
            <div className="mt-6">
              <SignInForm defaultCountry={defaultCountry} next={next} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
