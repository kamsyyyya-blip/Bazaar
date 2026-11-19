/** Photo rules shared by the sell form, server action and upload storage. */

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
// Keep the whole Server Action request below Vercel Functions' 4.5 MB limit.
export const MAX_PHOTO_TOTAL_BYTES = 4 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const PHOTO_ACCEPT = Object.keys(MIME_EXTENSIONS).join(",");

export function photoExtension(type: string): string | null {
  return MIME_EXTENSIONS[type] ?? null;
}

export function isAllowedPhotoType(type: string): boolean {
  return Boolean(photoExtension(type));
}

/** Check file contents too; browser supplied MIME types are user controlled. */
export function hasPhotoSignature(type: string, bytes: Uint8Array): boolean {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  switch (type) {
    case "image/jpeg":
      return bytes.length >= 3 && startsWith(0xff, 0xd8, 0xff);
    case "image/png":
      return bytes.length >= 8 && startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/gif":
      return bytes.length >= 6 && (startsWith(0x47, 0x49, 0x46, 0x38, 0x37, 0x61) || startsWith(0x47, 0x49, 0x46, 0x38, 0x39, 0x61));
    case "image/webp":
      return bytes.length >= 12 && startsWith(0x52, 0x49, 0x46, 0x46) &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    default:
      return false;
  }
}
