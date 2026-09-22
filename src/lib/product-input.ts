import type { ProductInput } from "@/lib/products";

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Validate + normalise an incoming admin product payload. */
export function normaliseInput(body: Record<string, unknown>): ProductInput | { error: string } {
  const nameEn = String(body?.nameEn ?? "").trim();
  if (nameEn.length < 2) return { error: "English name is required" };

  const price = num(body?.price, NaN);
  if (!Number.isFinite(price) || price < 0) return { error: "A valid price is required" };

  const oldPriceRaw = body?.oldPrice;
  let oldPrice: number | null = null;
  if (oldPriceRaw !== null && oldPriceRaw !== "" && oldPriceRaw !== undefined) {
    const op = Number(oldPriceRaw);
    if (!Number.isFinite(op) || op < 0) return { error: "Old price must be a positive number" };
    if (op <= price) return { error: "Old price must be higher than the current price" };
    oldPrice = Math.round(op * 100) / 100;
  }

  const stock = Math.max(0, Math.min(9999, Math.round(num(body?.stock, 25))));
  const badgeRaw = body?.badge;
  const badge =
    badgeRaw && ["popular", "new", "fresh"].includes(String(badgeRaw)) ? String(badgeRaw) : null;

  // Gallery images: up to 8 URLs, each trimmed, de-duplicated.
  const rawImages = Array.isArray(body?.images) ? body.images : [];
  const images: string[] = [];
  for (const item of rawImages) {
    const url = String(item ?? "").trim().slice(0, 600);
    if (url !== "" && !images.includes(url)) images.push(url);
    if (images.length >= 8) break;
  }
  const image =
    String(body?.image ?? "").trim() || images[0] || "/images/prod-rice.png";

  return {
    slug: String(body?.slug ?? "").trim(), // empty -> the data layer slugifies from the name
    nameEn,
    nameFi: String(body?.nameFi ?? "").trim(),
    descEn: String(body?.descEn ?? "").trim(),
    descFi: String(body?.descFi ?? "").trim(),
    price: Math.round(price * 100) / 100,
    oldPrice,
    unit: String(body?.unit ?? "").trim(),
    category: String(body?.category ?? "asian"),
    image,
    images,
    badge,
    bestSeller: Boolean(body?.bestSeller),
    stock,
  };
}
