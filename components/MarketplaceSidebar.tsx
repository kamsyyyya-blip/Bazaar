import Link from "next/link";
import type { Category } from "@/lib/db";
import { browseHref, hasActiveFilters, SORT_OPTIONS, type Filters } from "@/lib/filters";

type Props = {
  categories: Category[];
  filters: Filters;
  total: number;
  priceOptions: { value: number; label: string }[];
};

function Row({
  href,
  active,
  children,
  meta,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={[
        "flex items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-[14px] leading-snug transition",
        active ? "bg-paper-2 font-medium text-ink" : "text-ink-soft hover:bg-paper hover:text-ink",
      ].join(" ")}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {meta ? <span className="shrink-0 pt-px text-[12px] tabular-nums text-ink-soft">{meta}</span> : null}
    </Link>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <p className="border-b border-line px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {title}
      </p>
      <nav className="p-1.5">{children}</nav>
    </div>
  );
}

export default function MarketplaceSidebar({ categories, filters, total, priceOptions }: Props) {
  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-4">
      <Group title="Categories">
        <Row href={browseHref(filters, { category: "" })} active={!filters.category} meta={String(total)}>
          All listings
        </Row>
        {categories.map((category) => (
          <Row
            key={category.slug}
            href={browseHref(filters, { category: category.slug })}
            active={filters.category === category.slug}
            meta={String(category.count)}
          >
            <span className="mr-1" aria-hidden="true">
              {category.emoji}
            </span>
            {category.name}
          </Row>
        ))}
      </Group>

      <Group title="Price">
        <Row href={browseHref(filters, { max: undefined })} active={!filters.max}>
          Any price
        </Row>
        {priceOptions.map((option) => (
          <Row
            key={option.value}
            href={browseHref(filters, { max: option.value })}
            active={filters.max === option.value}
          >
            {option.label}
          </Row>
        ))}
      </Group>

      <Group title="Sort by">
        {SORT_OPTIONS.map((option) => (
          <Row
            key={option.value}
            href={browseHref(filters, { sort: option.value })}
            active={filters.sort === option.value}
          >
            {option.label}
          </Row>
        ))}
      </Group>

      {active ? (
        <Link
          href="/#trending"
          className="block rounded-full border border-line bg-white px-4 py-2 text-center text-xs font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink"
        >
          Clear all filters
        </Link>
      ) : null}
    </div>
  );
}
