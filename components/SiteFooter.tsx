import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const LINKS = [
  {
    title: "Shop",
    items: [
      { label: "All listings", href: "/#trending" },
      { label: "Categories", href: "/#categories" },
      { label: "Editor's picks", href: "/#recommended" },
      { label: "New arrivals", href: "/?sort=newest#trending" },
      { label: "Fresh finds", href: "/?sort=newest#trending" },
    ],
  },
  {
    title: "Selling",
    items: [
      { label: "Start selling", href: "/sell" },
      { label: "Seller handbook", href: "/sell" },
      { label: "Seller stories", href: "/#recommended" },
      { label: "Community", href: "/#sell" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Shipping & returns", href: "/#trending" },
      { label: "Buyer protection", href: "/#trending" },
      { label: "Contact", href: "mailto:hello@bazaar.shop" },
      { label: "Accessibility", href: "/#trending" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 bg-footer text-on-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-clay font-display text-lg text-on-dark">
                b
              </span>
              <span className="font-display text-xl tracking-tight">Bazaar</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-on-dark/60">
              A local marketplace for the things you actually need — electronics, clothing, home goods, pets and more.
              Every listing comes from a seller we&rsquo;d happily buy from ourselves.
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-dark/60">
                Five good finds, every Friday
              </p>
              <div className="mt-3">
                <NewsletterForm />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-on-dark/60">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-on-dark/70 transition hover:text-on-dark">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-on-dark/10 pt-6 text-xs text-on-dark/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bazaar. A demo marketplace built with Next.js and SQLite.</p>
          <p className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              Demo data · no real orders
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
