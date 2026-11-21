import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import EditListingForm from "@/components/EditListingForm";
import SiteHeader from "@/components/SiteHeader";
import { deleteListingAction, setListingStatusAction } from "@/app/actions/seller-listings";
import { getCurrentUser } from "@/lib/auth";
import { listCategories } from "@/lib/db";
import { listAllDurableProducts } from "@/lib/durable-products";

export const metadata: Metadata = { title: "My listings", description: "Manage your Bazaar listings." };

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/my-listings")}`);
  const all = await listAllDurableProducts();
  const listings = all.filter((product) => product.ownerId === String(user.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const categories = listCategories();
  const activeCount = listings.filter((product) => product.status !== "sold").length;
  const soldCount = listings.length - activeCount;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-14 pt-7 sm:px-6 sm:pt-11 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Seller studio</p>
            <h1 className="mt-2 text-3xl sm:text-4xl">My listings</h1>
            <p className="mt-2 text-sm text-ink-soft">{activeCount} active · {soldCount} sold</p>
          </div>
          <Link href="/sell" className="inline-flex h-10 items-center rounded-full bg-clay px-5 text-sm font-semibold text-on-dark transition hover:bg-clay-dark">List an item</Link>
        </div>

        {listings.length ? (
          <ul className="mt-8 divide-y divide-line border-t border-line">
            {listings.map((product) => (
              <li key={product.slug} className="py-5 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/listing/${product.slug}`} className="font-display text-lg font-semibold hover:text-clay">{product.title}</Link>
                    <p className="mt-1 max-w-2xl line-clamp-2 text-sm leading-relaxed text-ink-soft">{product.description}</p>
                    <p className="mt-2 text-xs text-ink-soft">{product.categoryName} · {product.location}, {product.county} · {product.status === "sold" ? "Sold" : "Active"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <form action={setListingStatusAction}>
                      <input type="hidden" name="slug" value={product.slug} />
                      <input type="hidden" name="status" value={product.status === "sold" ? "active" : "sold"} />
                      <button type="submit" className="min-h-10 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink transition hover:border-ink/30">
                        Mark {product.status === "sold" ? "active" : "sold"}
                      </button>
                    </form>
                    <form action={deleteListingAction}>
                      <input type="hidden" name="slug" value={product.slug} />
                      <button type="submit" className="min-h-10 rounded-full border border-danger/30 px-4 text-xs font-semibold text-danger transition hover:bg-danger/5">Delete</button>
                    </form>
                  </div>
                </div>
                <EditListingForm product={product} categories={categories} />
              </li>
            ))}
          </ul>
        ) : (
          <section className="mt-8 border-y border-line px-5 py-16 text-center">
            <h2 className="text-xl">No manageable listings yet</h2>
            <p className="mt-2 text-sm text-ink-soft">Listings you create while signed in will appear here.</p>
            <Link href="/sell" className="mt-5 inline-flex h-10 items-center rounded-full bg-clay px-5 text-sm font-semibold text-on-dark transition hover:bg-clay-dark">Create your first listing</Link>
          </section>
        )}
      </main>
    </>
  );
}
