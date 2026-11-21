"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import { createListingAction, type SellState } from "@/app/actions/listings";
import CountrySelect from "@/components/CountrySelect";
import StateSelect from "@/components/StateSelect";
import { CONDITIONS } from "@/lib/filters";
import type { Category, User } from "@/lib/db";
import { HOME_COUNTRY, countryName } from "@/lib/countries";
import { currencyForCountry, currencyName } from "@/lib/currency";
import { MAX_PHOTOS, MAX_PHOTO_TOTAL_BYTES, PHOTO_ACCEPT } from "@/lib/photos";

type Props = {
  categories: Category[];
  user: User;
  defaultCountry?: string;
  defaultCounty?: string;
};

const field =
  "h-11 w-full border-x-0 border-b border-t-0 border-line bg-transparent px-0 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay";
const textareaField =
  "w-full resize-y border-x-0 border-b border-t-0 border-line bg-transparent px-0 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-clay";
const label = "text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft";

export default function SellForm({ categories, user, defaultCountry = HOME_COUNTRY, defaultCounty = "" }: Props) {
  const [state, action, pending] = useActionState(createListingAction, {} as SellState);
  const [country, setCountry] = useState(defaultCountry);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Array<{ name: string; url: string }>>([]);
  const [photoError, setPhotoError] = useState("");
  const [cleared, setCleared] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoUrls = useRef<string[]>([]);
  const dragIndex = useRef<number | null>(null);
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
    const totalBytes = next.reduce((total, file) => total + file.size, 0);
    if (totalBytes > MAX_PHOTO_TOTAL_BYTES) {
      replacePhotos([]);
      syncInput([]);
      event.target.value = "";
      setPhotoError("Your photos are too large to upload together. Choose smaller images with a combined size under 4 MB.");
      return;
    }
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

  function movePhoto(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    replacePhotos(next);
    syncInput(next);
  }

  function clearForm() {
    formRef.current?.reset();
    setCountry(defaultCountry);
    replacePhotos([]);
    syncInput([]);
    setPhotoError("");
    setCleared(true);
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={() => setCleared(false)}
      className="bg-paper sm:rounded-2xl sm:border sm:border-line sm:bg-surface"
    >
      <header className="sticky top-[68px] z-40 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur-md sm:rounded-t-2xl sm:px-6">
        <Link href="/" className="text-sm text-ink-soft transition hover:text-ink">
          Cancel
        </Link>
        <h1 className="font-display text-base font-semibold text-ink">New Advert</h1>
        <button type="button" onClick={clearForm} className="text-sm text-ink-soft transition hover:text-ink">
          Clear
        </button>
      </header>

      <div className="divide-y divide-line px-4 pb-10 sm:px-6">
        <section className="space-y-5 pb-7 pt-6 sm:pt-7">
          <div>
            <label htmlFor="sell-title" className={label}>
              Title*
            </label>
            <input
              id="sell-title"
              name="title"
              required
              minLength={4}
              maxLength={90}
              placeholder="What are you advertising?"
              className={`${field} mt-1`}
            />
          </div>

          <div>
            <label htmlFor="sell-category" className={label}>
              Category*
            </label>
            <select id="sell-category" name="category" required defaultValue="" className={`${field} mt-1`}>
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

          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <div>
              <label htmlFor="sell-condition" className={label}>
                Condition
              </label>
              <select id="sell-condition" name="condition" required defaultValue="Good" className={`${field} mt-1`}>
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sell-price" className={label}>
                Price ({currency})
              </label>
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
                className={`${field} mt-1`}
              />
              <p className="mt-1.5 text-xs text-ink-soft">Buyers pay in {currencyName(currency)}.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 py-7">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="sell-photos" className={label}>
                Images
              </label>
              <span className="text-xs tabular-nums text-ink-soft">
                {photos.length} of {MAX_PHOTOS}
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
              className="mt-2 w-full cursor-pointer rounded-xl border border-dashed border-line bg-paper/60 px-3.5 py-4 text-xs text-ink-soft outline-none transition file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:text-paper hover:border-clay/50 focus:border-clay"
            />
            <div className="mt-2.5 space-y-1 text-xs leading-relaxed text-ink-soft">
              <p>First picture is the title picture.</p>
              <p>Grab &amp; drag photos to change the order.</p>
              <p>Supported formats are .jpg, .jpeg, .png, .webp and .gif.</p>
              <p>Each picture must not exceed 6 Mb, with 4 Mb allowed in total.</p>
            </div>
            {photoError ? (
              <p role="alert" className="mt-2 text-xs font-medium text-danger">
                {photoError}
              </p>
            ) : null}
            {previews.length > 0 ? (
              <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {previews.map((preview, index) => (
                  <li
                    key={preview.url}
                    draggable
                    onDragStart={() => {
                      dragIndex.current = index;
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (dragIndex.current !== null) movePhoto(dragIndex.current, index);
                      dragIndex.current = null;
                    }}
                    className="group relative cursor-grab overflow-hidden rounded-xl border border-line bg-paper active:cursor-grabbing"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview.url} alt={preview.name} className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label={`Remove ${preview.name}`}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-xs font-semibold text-paper transition hover:bg-clay-dark"
                    >
                      ×
                    </button>
                    {index === 0 ? (
                      <span className="absolute inset-x-1 bottom-1 rounded-md bg-clay px-1 py-0.5 text-center text-[11px] font-medium text-on-dark">
                        Cover
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="py-7">
          <fieldset>
            <legend className={label}>Region</legend>
            <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-3">
              <div>
                <label htmlFor="sell-country" className={label}>
                  Country
                </label>
                <CountrySelect
                  id="sell-country"
                  name="country"
                  value={country}
                  onChange={setCountry}
                  className={`${field} mt-1`}
                />
              </div>

              <div>
                <label htmlFor="sell-county" className={label}>
                  State / province
                </label>
                <StateSelect
                  id="sell-county"
                  name="county"
                  country={country}
                  defaultValue={defaultCounty}
                  required
                  optional={false}
                  className={`${field} mt-1`}
                />
              </div>

              <div>
                <label htmlFor="sell-location" className={label}>
                  City
                </label>
                <input
                  id="sell-location"
                  name="location"
                  required
                  maxLength={80}
                  placeholder="Austin"
                  className={`${field} mt-1`}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-soft">Posting to {countryName(country)}. Your email stays private.</p>
          </fieldset>
        </section>

        <section className="py-7">
          <label htmlFor="sell-description" className={label}>
            Description
          </label>
          <textarea
            id="sell-description"
            name="description"
            required
            minLength={20}
            maxLength={2000}
            rows={6}
            placeholder="What are you selling, how old is it, and what should the buyer know?"
            className={`${textareaField} mt-2`}
          />
        </section>

        <section className="space-y-5 py-7">
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <div>
              <label htmlFor="sell-name" className={label}>
                Name
              </label>
              <input id="sell-name" value={user.name} readOnly className={`${field} mt-1 text-ink-soft`} />
            </div>

            <div>
              <label htmlFor="sell-phone" className={label}>
                Phone number*
              </label>
              <input
                id="sell-phone"
                name="phone"
                type="tel"
                required
                defaultValue={user.phone}
                placeholder="Your phone number"
                className={`${field} mt-1`}
              />
            </div>
          </div>
        </section>

        <section className="pt-7">
          {state.error && !cleared ? (
            <p role="alert" aria-live="polite" className="mb-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-clay px-7 text-sm font-semibold text-on-dark transition hover:bg-clay-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              {pending ? "Posting…" : "Post ad"}
              {!pending ? <span aria-hidden="true">→</span> : null}
            </button>
            <p className="text-xs text-ink-soft">No listing fees for 90 days. You keep 92% of every sale.</p>
          </div>
        </section>
      </div>
    </form>
  );
}
