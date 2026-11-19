import assert from "node:assert/strict";
import test from "node:test";
import { hasPhotoSignature, isAllowedPhotoType } from "../lib/photos.ts";

test("accepts matching signatures for each supported listing image format", () => {
  assert.equal(hasPhotoSignature("image/jpeg", Uint8Array.from([0xff, 0xd8, 0xff, 0x00])), true);
  assert.equal(hasPhotoSignature("image/png", Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
  assert.equal(hasPhotoSignature("image/gif", new TextEncoder().encode("GIF89a")), true);
  assert.equal(hasPhotoSignature("image/webp", new TextEncoder().encode("RIFF0000WEBP")), true);
});

test("rejects MIME spoofing and truncated signatures", () => {
  assert.equal(isAllowedPhotoType("image/svg+xml"), false);
  assert.equal(hasPhotoSignature("image/png", new TextEncoder().encode("not an image")), false);
  assert.equal(hasPhotoSignature("image/jpeg", Uint8Array.from([0xff, 0xd8])), false);
  assert.equal(hasPhotoSignature("image/png", Uint8Array.from([0x89, 0x50, 0x4e])), false);
  assert.equal(hasPhotoSignature("application/pdf", Uint8Array.from([0x25, 0x50, 0x44, 0x46])), false);
});
