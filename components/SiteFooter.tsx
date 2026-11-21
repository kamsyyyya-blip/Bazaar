import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const LINKS = [
  {
    title: "Shop",
    items: [
      { label: "All listings", href: "/#trending" },
      { label: "Categories", href: "/#categories" },
      { label: "New arrivals", href: "/?sort=newest#trending" },
    ],
  },
  {
    title: "Selling",
    items: [
      { label: "Start selling", href: "/sell" },
      { label: "My listings", href: "/my-listings" },
      { label: "Seller handbook", href: "/sell" },
      { label: "Community", href: "/#sell" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Saved listings", href: "/favorites" },
      { label: "Messages", href: "/messages" },
      { label: "Appearance", href: "/settings#appearance" },
      { label: "Contact", href: "mailto:hello@bazaar.shop" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-footer text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2" aria-label="Bazaar home">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm font-semibold leading-none text-footer">
                b
              </span>
              <span className="text-lg font-semibold tracking-[-0.045em]">Bazaar</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              A considered marketplace for the things you actually need — from local sellers, without the noise.
            </p>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
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
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-white/70 transition hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bazaar. A local marketplace.</p>
          <p className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              Demo marketplace
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
