"use client";

import { useActionState } from "react";
import Link from "next/link";
import { addToCartAction, type CartActionState } from "@/app/actions/cart";

const initialState: CartActionState = {};

export default function AddToCartForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(addToCartAction, initialState);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <form action={action} className="flex">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="next" value={`/listing/${slug}`} />
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition hover:bg-clay disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Adding…" : state.success ? "Added to cart" : "Add to cart"}
          {!pending ? <span aria-hidden="true">{state.success ? "✓" : "→"}</span> : null}
        </button>
      </form>
      {state.error ? <p role="alert" className="text-sm text-clay-dark">{state.error}</p> : null}
      {state.success ? (
        <p role="status" className="text-sm text-olive">
          Added to your cart. <Link href="/cart" className="font-semibold underline">View cart</Link>
        </p>
      ) : null}
    </div>
  );
}
