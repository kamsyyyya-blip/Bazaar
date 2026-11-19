import { randomUUID } from "node:crypto";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPhotoSignature, photoExtension } from "./photos";

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
  const uploaded: string[] = [];
  try {
    for (const file of files) {
      const extension = photoExtension(file.type);
      if (!extension) throw new Error(`Unsupported photo type: ${file.type}`);
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!hasPhotoSignature(file.type, bytes)) throw new Error("Photo content does not match its file type.");
      const filename = `${randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(filename, bytes, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });
      if (error) throw error;
      uploaded.push(filename);
      urls.push(supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(filename).data.publicUrl);
    }
  } catch (error) {
    if (uploaded.length) {
      const { error: cleanupError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploaded);
      if (cleanupError) console.error("Could not clean up partial listing image upload", cleanupError);
    }
    throw error;
  }
  return urls;
}

export async function removeProductImages(urls: string[]): Promise<void> {
  const prefix = "/storage/v1/object/public/" + PRODUCT_IMAGES_BUCKET + "/";
  const paths = urls.flatMap((url) => {
    try {
      const pathname = new URL(url).pathname;
      const marker = pathname.indexOf(prefix);
      return marker < 0 ? [] : [decodeURIComponent(pathname.slice(marker + prefix.length))];
    } catch {
      return [];
    }
  });
  if (!paths.length) return;
  const { error } = await createAdminClient().storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  if (error) throw error;
}
