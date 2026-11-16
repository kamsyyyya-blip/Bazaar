import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const SAFE_NAME = /^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif)$/;

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const extension = name.split(".").pop()?.toLowerCase() ?? "";

  if (!SAFE_NAME.test(name) || !CONTENT_TYPES[extension]) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
