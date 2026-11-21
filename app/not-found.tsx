import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-5 py-16">
      <div className="w-full rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-soft sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">404 · Page not found</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">This page is empty</h1>
        <div className="mx-auto mt-6 h-px w-12 bg-line" aria-hidden="true" />
        <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-ink-soft">
          The listing you&rsquo;re looking for has sold, moved, or never existed. Plenty more where that came from.
        </p>
        <Link
          href="/#trending"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-clay px-6 text-sm font-medium text-on-dark transition hover:bg-clay-dark"
        >
          Back to the marketplace
        </Link>
      </div>
    </main>
  );
}
