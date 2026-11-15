import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">404</p>
        <h1 className="mt-3 text-4xl">This page is empty</h1>
        <p className="mt-3 text-sm text-ink-soft">
          The listing you&rsquo;re looking for has sold, moved, or never existed. Plenty more where that came from.
        </p>
        <Link
          href="/#trending"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-clay"
        >
          Back to the marketplace
        </Link>
      </div>
    </main>
  );
}
