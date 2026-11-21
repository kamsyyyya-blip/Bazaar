"use client";

import { useActionState } from "react";
import { updateListingAction, type SellerListingState } from "@/app/actions/seller-listings";
import type { Category, Product } from "@/lib/db";
import { currencyForCountry, fromMinorUnits } from "@/lib/currency";
import { CONDITIONS } from "@/lib/filters";

const initialState: SellerListingState = {};

const field =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay";
const label = "grid gap-1.5 text-xs font-medium text-ink-soft";

export default function EditListingForm({ product, categories }: { product: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState(updateListingAction, initialState);
  return (
    <details className="group mt-5 border-t border-line pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        Edit listing details
        <span aria-hidden="true" className="text-lg leading-none text-ink-soft transition group-open:rotate-180">⌄</span>
      </summary>
      <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="slug" value={product.slug} />
        <label className={`${label} sm:col-span-2`}>Title
          <input name="title" required minLength={4} maxLength={90} defaultValue={product.title} className={field} />
        </label>
        <label className={label}>Price
          <input name="price" required type="number" min="1" step="any" defaultValue={fromMinorUnits(product.price, currencyForCountry(product.country))} className={field} />
        </label>
        <label className={label}>Category
          <select name="category" defaultValue={product.category} className={field}>
            {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className={label}>Condition
          <select name="condition" defaultValue={product.condition} className={field}>
            {CONDITIONS.map((condition) => <option key={condition}>{condition}</option>)}
          </select>
        </label>
        <label className={label}>City
          <input name="location" required maxLength={80} defaultValue={product.location} className={field} />
        </label>
        <label className={label}>State or province
          <input name="county" required maxLength={90} defaultValue={product.county} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>Description
          <textarea name="description" required minLength={20} maxLength={2000} rows={4} defaultValue={product.description} className="resize-y rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay" />
        </label>
        {state.error ? <p role="alert" className="text-sm text-danger sm:col-span-2">{state.error}</p> : null}
        {state.success ? <p role="status" className="text-sm text-clay sm:col-span-2">{state.success}</p> : null}
        <button type="submit" disabled={pending} className="inline-flex h-10 w-full items-center justify-center rounded-full bg-clay px-5 text-sm font-semibold text-on-dark disabled:opacity-60 sm:col-span-2 sm:w-auto">
          {pending ? "Saving…" : "Save listing"}
        </button>
      </form>
    </details>
  );
}
