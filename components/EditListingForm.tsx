"use client";

import { useActionState } from "react";
import { updateListingAction, type SellerListingState } from "@/app/actions/seller-listings";
import type { Category, Product } from "@/lib/db";
import { currencyForCountry, fromMinorUnits } from "@/lib/currency";
import { CONDITIONS } from "@/lib/filters";

const initialState: SellerListingState = {};

export default function EditListingForm({ product, categories }: { product: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState(updateListingAction, initialState);
  return (
    <details className="mt-3 rounded-xl border border-line bg-paper/50 p-3">
      <summary className="cursor-pointer text-sm font-semibold">Edit listing details</summary>
      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="slug" value={product.slug} />
        <label className="grid gap-1 text-xs font-medium sm:col-span-2">Title
          <input name="title" required minLength={4} maxLength={90} defaultValue={product.title} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-xs font-medium">Price
          <input name="price" required type="number" min="1" step="any" defaultValue={fromMinorUnits(product.price, currencyForCountry(product.country))} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-xs font-medium">Category
          <select name="category" defaultValue={product.category} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium">Condition
          <select name="condition" defaultValue={product.condition} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            {CONDITIONS.map((condition) => <option key={condition}>{condition}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium">City
          <input name="location" required maxLength={80} defaultValue={product.location} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-xs font-medium">State or province
          <input name="county" required maxLength={90} defaultValue={product.county} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-xs font-medium sm:col-span-2">Description
          <textarea name="description" required minLength={20} maxLength={2000} rows={4} defaultValue={product.description} className="resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </label>
        {state.error ? <p role="alert" className="text-sm text-danger sm:col-span-2">{state.error}</p> : null}
        {state.success ? <p role="status" className="text-sm text-clay sm:col-span-2">{state.success}</p> : null}
        <button type="submit" disabled={pending} className="h-10 rounded-full bg-clay px-5 text-sm font-semibold text-on-dark disabled:opacity-60 sm:col-span-2">
          {pending ? "Saving…" : "Save listing"}
        </button>
      </form>
    </details>
  );
}
