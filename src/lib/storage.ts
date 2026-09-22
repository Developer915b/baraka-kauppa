// Product image pipeline: optimise uploads with sharp, then store them in the
// Supabase Storage bucket `product_images` (public bucket).
//
// - Large phone photos are resized to fit 1000×1000 (never upscaled) and
//   re-encoded as WebP quality 85 — visually identical to the original at
//   roughly 10–20 % of the file size.
// - EXIF orientation is applied so photos never come out sideways.
// - The image files live in object storage, NOT in the database; the database
//   only stores the small public URLs.

import { randomBytes } from "crypto";
import sharp from "sharp";
import { SbError } from "@/lib/supabase";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const BUCKET = "product_images";

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB input limit

export const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export type OptimisedImage = { url: string; bytes: number };

export async function optimiseAndUploadImage(
  input: Buffer,
  originalName = "photo"
): Promise<OptimisedImage> {
  if (!SUPABASE_URL || !SECRET_KEY) {
    throw new SbError("Image storage is not configured yet", 503);
  }

  let webp: Buffer;
  try {
    webp = await sharp(input)
      .rotate() // respect EXIF orientation
      .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();
  } catch {
    throw new SbError("That file could not be read as an image", 400);
  }

  const base = originalName
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "photo";
  const fileName = `${base}-${Date.now().toString(36)}${randomBytes(3).toString("hex")}.webp`;

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`, {
      method: "POST",
      headers: {
        apikey: SECRET_KEY,
        Authorization: `Bearer ${SECRET_KEY}`,
        "Content-Type": "image/webp",
        "Cache-Control": "31536000",
        "x-upsert": "true",
      },
      body: new Uint8Array(webp),
    });
  } catch {
    throw new SbError("Could not reach image storage", 502);
  }

  if (!res.ok) {
    let message = `Image upload failed (${res.status})`;
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      message = data?.message || data?.error || message;
    } catch {
      // keep default
    }
    throw new SbError(message, res.status);
  }

  return {
    url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`,
    bytes: webp.length,
  };
}
