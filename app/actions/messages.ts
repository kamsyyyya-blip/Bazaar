"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addMessage,
  ensureConversation,
  getConversation,
  getProduct,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDurableProduct } from "@/lib/durable-products";

export type MessageState = { error?: string; sent?: boolean };

const MAX_MESSAGE = 1200;

function validateBody(raw: FormDataEntryValue | null): { body?: string; error?: string } {
  const body = String(raw ?? "").trim();
  if (body.length < 2) return { error: "Write a short message first." };
  if (body.length > MAX_MESSAGE) {
    return { error: `Keep your message under ${MAX_MESSAGE.toLocaleString("en-US")} characters.` };
  }
  return { body };
}

function totalUnreadRevalidation(slug: string) {
  revalidatePath("/messages");
  revalidatePath("/", "layout");
  revalidatePath(`/listing/${slug}`);
}

/** Starts a thread (or appends to an existing one) from a listing page. */
export async function startConversationAction(
  _state: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to message this seller." };

  const slug = String(formData.get("slug") ?? "");
  const product = await getDurableProduct(slug) ?? getProduct(slug);
  if (!product) return { error: "That listing is no longer available." };
  if (product.ownerId ? product.ownerId === String(user.id) : product.seller === user.name) {
    return { error: "This is your own listing — buyers will message you here." };
  }

  const { body, error } = validateBody(formData.get("body"));
  if (error || !body) return { error };

  let conversation: ReturnType<typeof ensureConversation>;
  try {
    conversation = ensureConversation({
      product,
      buyerEmail: user.email,
      buyerName: user.name,
    });
  } catch (error) {
    console.error("Could not create listing conversation", error);
    return { error: "Messaging is temporarily unavailable for this listing. Please try again shortly." };
  }
  if (!conversation) return { error: "That listing is no longer available." };

  addMessage({
    conversationId: conversation.id,
    senderRole: "buyer",
    senderName: user.name,
    body,
  });

  if (conversation.created) {
    addMessage({
      conversationId: conversation.id,
      senderRole: "seller",
      senderName: product.seller,
      body: `Thanks for reaching out about “${product.title}”. It’s still available — happy to answer questions or arrange a pickup in ${product.county}.`,
    });
  }

  totalUnreadRevalidation(product.slug);
  redirect(`/messages/${conversation.id}`);
}

/** Appends a buyer reply inside an existing thread. */
export async function replyAction(_state: MessageState, formData: FormData): Promise<MessageState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session expired. Sign in again to reply." };

  const id = Number(formData.get("conversationId"));
  if (!Number.isInteger(id) || id <= 0) return { error: "That conversation could not be found." };

  const conversation = getConversation(id, user.email);
  if (!conversation) return { error: "That conversation could not be found." };

  const { body, error } = validateBody(formData.get("body"));
  if (error || !body) return { error };

  addMessage({
    conversationId: conversation.id,
    senderRole: "buyer",
    senderName: user.name,
    body,
  });

  totalUnreadRevalidation(conversation.productSlug);
  revalidatePath(`/messages/${conversation.id}`);
  return { sent: true };
}
