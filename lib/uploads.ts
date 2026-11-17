import { randomUUID } from "node:crypto";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { photoExtension } from "./photos";

const PRODUCT_IMAGES_BUCKET = "product-images";

// Kept for the local-only legacy /api/uploads route. New listing photos never
// use this filesystem path, and production uploads always go to Supabase.
export const UPLOAD_DIR = process.env.VERCEL === "1"
  ? path.join("/tmp", "bazaar", "uploads")
  : path.join(process.cwd(), "data", "uploads");

/** Uploads validated listing photos to Supabase Storage and returns public URLs. */
export async function saveProductImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const supabase = createAdminClient();
  const urls: string[] = [];
  for (const file of files) {
    const extension = photoExtension(file.type);
    if (!extension) throw new Error(`Unsupported photo type: ${file.type}`);
    const filename = `${randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filename, new Uint8Array(await file.arrayBuffer()), {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;
    urls.push(supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(filename).data.publicUrl);
  }
  return urls;
}
