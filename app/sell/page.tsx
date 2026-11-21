import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SellForm from "@/components/SellForm";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { listCategories } from "@/lib/db";

export const metadata: Metadata = {
  title: "New Advert",
  description: "List something for sale to buyers in your area on Bazaar.",
};

export default async function SellPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/sell")}`);

  const categories = listCategories();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-0 pb-12 sm:px-4 sm:pb-14 sm:pt-8">
        <SellForm
          categories={categories}
          user={user}
          defaultCountry={user.country}
          defaultCounty={user.county}
        />
      </main>
    </>
  );
}
