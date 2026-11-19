import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import MarketplaceCard from "@/components/MarketplaceCard";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { getProduct } from "@/lib/db";
import { getDurableProduct } from "@/lib/durable-products";

export const metadata: Metadata = {
  title: "Saved listings",
  description: "Listings you have saved on Bazaar.",
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/favorites")}`);

  const saved = await Promise.all((user.favorites ?? []).map(async (slug) =>
    getProduct(slug) ?? await getDurableProduct(slug),
  ));
  const products = saved.filter((product) => product !== null);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink">Home</Link><span aria-hidden="true">/</span><span className="text-ink">Saved listings</span>
        </nav>
        <div className="mt-5">
          <h1 className="text-2xl sm:text-4xl">Saved listings</h1>
          <p className="mt-2 text-sm text-ink-soft">{products.length} {products.length === 1 ? "listing" : "listings"} saved to your account.</p>
        </div>
        {products.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <MarketplaceCard key={product.slug} product={product} />)}
          </div>
        ) : (
          <section className="mt-7 rounded-2xl border border-dashed border-line bg-white px-5 py-14 text-center">
            <h2 className="text-xl">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-ink-soft">Tap the heart on a listing and it will be saved here.</p>
            <Link href="/#trending" className="mt-5 inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-paper">Browse listings</Link>
          </section>
        )}
      </main>
    </>
  );
}
