import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignInForm from "@/components/SignInForm";
import SiteFooter from "@/components/SiteFooter";
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

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Welcome to Bazaar</p>
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">Sign in to buy and sell locally.</h1>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-soft">
              Save your country and state, message sellers and leave reviews. No password to remember — this demo signs you in
              with just your email.
            </p>

            <ul className="mt-8 space-y-4 text-sm text-ink-soft">
              {[
                "Set your country so the right listings surface first.",
                "Message sellers and keep the conversation in one place.",
                "Review items you have bought and help your neighbours.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-olive/10 text-[11px] font-semibold text-olive"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs text-ink-soft">
              Just browsing?{" "}
              <Link href="/#trending" className="font-medium text-ink underline decoration-line underline-offset-4 hover:text-clay">
                Keep exploring the marketplace
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-7">
            {nextLabel ? (
              <p className="mb-4 rounded-xl border border-line bg-paper-2/60 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
                Sign in to continue to <span className="font-medium text-ink">{nextLabel}</span>. If you were already
                signed in, your demo session may have expired — this form takes you straight back.
              </p>
            ) : null}
            <h2 className="font-display text-2xl">Sign in or create an account</h2>
            <p className="mt-1 text-xs text-ink-soft">One form for both — we&rsquo;ll find your account by email.</p>
            <div className="mt-5">
              <SignInForm defaultCountry={defaultCountry} next={next} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
