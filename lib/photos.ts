/** Photo rules shared by the sell form, server action and upload storage. */

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 6 * 1024 * 1024;

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
