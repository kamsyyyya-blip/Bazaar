import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { photoExtension } from "./photos";

// Vercel functions can write only to temporary storage. This makes uploaded
// images available during a warm function instance, but they are not durable.
export const UPLOAD_DIR = process.env.VERCEL === "1"
  ? path.join("/tmp", "bazaar", "uploads")
  : path.join(process.cwd(), "data", "uploads");

/** Writes validated photos to disk and returns their stored filenames. */
export async function saveProductImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const filenames: string[] = [];
  for (const file of files) {
    const extension = photoExtension(file.type);
    if (!extension) throw new Error(`Unsupported photo type: ${file.type}`);

    const filename = `${randomUUID()}.${extension}`;
    await fs.writeFile(
      path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, filename),
      Buffer.from(await file.arrayBuffer()),
    );
    filenames.push(filename);
  }

  return filenames;
}
