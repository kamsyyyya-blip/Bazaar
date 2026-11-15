"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import { createListingAction, type SellState } from "@/app/actions/listings";
import CountrySelect from "@/components/CountrySelect";
import StateSelect from "@/components/StateSelect";
import { CONDITIONS } from "@/lib/filters";
import type { Category } from "@/lib/db";
import { HOME_COUNTRY, countryName } from "@/lib/countries";
import { currencyForCountry, currencyName } from "@/lib/currency";
import { MAX_PHOTOS, PHOTO_ACCEPT } from "@/lib/photos";

type Props = {
  categories: Category[];
  defaultCountry?: string;
  defaultCounty?: string;
};

const field =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition placeholder:text-ink-soft/60 focus:border-ink/35";

export default function SellForm({ categories, defaultCountry = HOME_COUNTRY, defaultCounty = "" }: Props) {
  const [state, action, pending] = useActionState(createListingAction, {} as SellState);
  const [country, setCountry] = useState(defaultCountry);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Array<{ name: string; url: string }>>([]);
  const [photoError, setPhotoError] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const photoUrls = useRef<string[]>([]);
  const currency = currencyForCountry(country);

  // Release blob URLs when the form unmounts.
  useEffect(() => {
    return () => {
      photoUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function replacePhotos(next: File[]) {
    photoUrls.current.forEach((url) => URL.revokeObjectURL(url));
    const nextPreviews = next.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    photoUrls.current = nextPreviews.map((preview) => preview.url);
    setPhotos(next);
    setPreviews(nextPreviews);
  }

  function syncInput(next: File[]) {
    if (!photoInput.current) return;
    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    photoInput.current.files = transfer.files;
  }

  function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    const next = picked.slice(0, MAX_PHOTOS);
    setPhotoError(
      picked.length > MAX_PHOTOS
        ? `You can add up to ${MAX_PHOTOS} photos. The extra files were ignored.`
        : "",
    );
    replacePhotos(next);
    syncInput(next);
  }

  function removePhoto(index: number) {
    const next = photos.filter((_, photoIndex) => photoIndex !== index);
    replacePhotos(next);
    syncInput(next);
    setPhotoError("");
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="sell-title" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
          Listing title
        </label>
        <input
          id="sell-title"
          name="title"
          required
          minLength={4}
          maxLength={90}
          placeholder="e.g. Solid oak writing desk"
          className={`${field} mt-1.5`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sell-category" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            Category
          </label>
          <select id="sell-category" name="category" required defaultValue="" className={`${field} mt-1.5`}>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sell-condition" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            Condition
          </label>
          <select id="sell-condition" name="condition" required defaultValue="Good" className={`${field} mt-1.5`}>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sell-price" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            Price ({currency})
          </label>
          <div className="relative mt-1.5">
            <input
              id="sell-price"
              name="price"
              type="number"
              inputMode="decimal"
              required
              min={1}
              max={1_000_000_000}
              step="any"
              placeholder="1200"
              className={field}
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">
            Buyers pay in {currencyName(currency)}. Change country above to switch currency.
          </p>
        </div>

        <div>
          <label htmlFor="sell-country" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            Country
          </label>
          <CountrySelect
            id="sell-country"
            name="country"
            value={country}
            onChange={setCountry}
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <label htmlFor="sell-county" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            State / province
          </label>
          <StateSelect
            id="sell-county"
            name="county"
            country={country}
            defaultValue={defaultCounty}
            required
            optional={false}
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <label htmlFor="sell-location" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            City
          </label>
          <input
            id="sell-location"
            name="location"
            required
            maxLength={80}
            placeholder="Austin"
            className={`${field} mt-1.5`}
          />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label htmlFor="sell-photos" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            Photos
          </label>
          <span className="text-xs text-ink-soft">
            {photos.length} of {MAX_PHOTOS} photos
          </span>
        </div>
        <input
          ref={photoInput}
          id="sell-photos"
          name="images"
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          onChange={handlePhotos}
          className="mt-1.5 w-full cursor-pointer rounded-xl border border-dashed border-line bg-white px-3.5 py-3 text-sm text-ink-soft outline-none transition file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:text-paper hover:border-ink/30 focus:border-ink/35"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Add up to {MAX_PHOTOS} pictures — JPG, PNG, WebP or GIF, 6 MB each. The first photo becomes the cover.
        </p>
        {photoError ? (
          <p role="alert" className="mt-2 text-xs font-medium text-clay-dark">
            {photoError}
          </p>
        ) : null}
        {previews.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((preview, index) => (
              <li key={preview.url} className="group relative overflow-hidden rounded-lg border border-line bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt={preview.name} className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove ${preview.name}`}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-xs font-semibold text-paper transition hover:bg-clay"
                >
                  ×
                </button>
                {index === 0 ? (
                  <span className="absolute inset-x-1 bottom-1 rounded bg-ink/75 px-1 py-0.5 text-center text-[11px] font-medium text-paper">
                    Cover
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <label htmlFor="sell-description" className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
          Description
        </label>
        <textarea
          id="sell-description"
          name="description"
          required
          minLength={20}
          maxLength={2000}
          rows={6}
          placeholder="What are you selling, how old is it, and what should the buyer know? Mention flaws, dimensions, pickup options and anything included."
          className="mt-1.5 w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-sm leading-relaxed outline-none transition placeholder:text-ink-soft/60 focus:border-ink/35"
        />
      </div>

      <div className="rounded-xl border border-line bg-paper-2/40 px-3.5 py-3 text-xs text-ink-soft">
        <p>
          <span aria-hidden="true" className="mr-1">
            📍
          </span>
          Posting to <span className="font-medium text-ink">{countryName(country)}</span>. Buyers can message you
          directly — your email stays private.
        </p>
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="rounded-xl bg-clay/10 px-3.5 py-2.5 text-sm text-clay-dark">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-medium text-paper transition hover:bg-clay disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish listing"}
          {!pending ? <span aria-hidden="true">→</span> : null}
        </button>
        <p className="text-xs text-ink-soft">No listing fees for 90 days. You keep 92% of every sale.</p>
      </div>
    </form>
  );
}
