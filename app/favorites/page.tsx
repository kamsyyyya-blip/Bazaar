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
  const favoriteFor = (slug: string) => ({
    signedIn: Boolean(user),
    initiallySaved: Boolean(user?.favorites?.includes(slug)),
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pt-14">
        <div className="border-b border-line pb-6 sm:pb-8">
          <h1 className="text-3xl leading-tight sm:text-4xl">Saved listings</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {products.length} {products.length === 1 ? "listing" : "listings"} saved to your account.
          </p>
        </div>
        {products.length ? (
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <MarketplaceCard key={product.slug} product={product} favorite={favoriteFor(product.slug)} />
            ))}
          </div>
        ) : (
          <section className="mt-9 border-y border-line py-14 text-center sm:py-20">
            <h2 className="text-xl sm:text-2xl">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-ink-soft">Tap the heart on a listing and it will be saved here.</p>
            <Link
              href="/#trending"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-clay px-5 text-sm font-medium tracking-tight text-on-dark transition-colors hover:bg-clay-dark"
            >
              Browse listings
            </Link>
          </section>
        )}
      </main>
    </>
  );
}
