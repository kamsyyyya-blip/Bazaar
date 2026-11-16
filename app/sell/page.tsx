import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SellForm from "@/components/SellForm";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { listCategories } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sell an item",
  description: "List something for sale to buyers in your area on Bazaar.",
};

export default async function SellPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/sell")}`);

  const categories = listCategories();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Sell an item</span>
        </nav>

        <div className="mt-5 max-w-2xl sm:mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">For sellers</p>
        <h1 className="mt-2 text-2xl leading-tight sm:text-4xl">List something for your area.</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Add a few honest details and your listing goes live immediately. Buyers message you through Bazaar, so your
            email stays private.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-2xl border border-line bg-white p-4 sm:p-6 lg:p-7">
            <h2 className="font-display text-xl sm:text-2xl">Your listing</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Selling as <span className="font-medium text-ink">{user.name}</span>
              {user.county ? ` · ${user.county}` : ""}.
            </p>
            <div className="mt-6">
              <SellForm categories={categories} defaultCountry={user.country} defaultCounty={user.county} />
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-6">
              <h2 className="font-display text-xl">How it works</h2>
              <ol className="mt-4 space-y-4 text-sm text-ink-soft">
                {[
                  "Describe the item with its real condition and any flaws.",
                  "Set a fair price and the city buyers can collect from.",
                  "Reply to messages in your Bazaar inbox — no email needed.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paper-2 text-[12px] font-semibold text-ink"
                    >
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-line bg-paper-2/50 p-5 text-sm">
              <p className="font-medium">Need to change something?</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                You can update your name, country, state and contact details from your profile at any time.
              </p>
              <Link href="/profile#settings" className="mt-3 inline-flex text-xs font-medium text-clay hover:text-clay-dark">
                Open profile &amp; settings →
              </Link>
            </div>
          </aside>
        </div>
      </main>

    </>
  );
}
