// Unified product data layer.
//
// Priority: Supabase (source of truth once connected) -> static catalog.
// Admin CRUD always targets Supabase (requires the secret key).

import { CATALOG, filterCatalog, type CatalogProduct } from "@/lib/catalog";
import { SbError, sbFetch } from "@/lib/supabase";

export type Product = CatalogProduct;

/** Raw row shape as stored in the Supabase `products` table (snake_case). */
export type SbProductRow = {
  id: number;
  created_at?: string;
  slug: string;
  name_en: string;
  name_fi: string;
  desc_en: string;
  desc_fi: string;
  price: number | string;
  old_price: number | string | null;
  unit: string;
  category: string;
  image: string;
  badge: string | null;
  best_seller: boolean;
  stock: number;
};

export function rowToProduct(row: SbProductRow): Product {
  return {
    id: Number(row.id),
    slug: row.slug,
    nameEn: row.name_en,
    nameFi: row.name_fi,
    descEn: row.desc_en,
    descFi: row.desc_fi,
    price: Number(row.price),
    oldPrice: row.old_price === null || row.old_price === undefined ? null : Number(row.old_price),
    unit: row.unit,
    category: row.category,
    image: row.image,
    badge: row.badge,
    bestSeller: row.best_seller,
    stock: Number(row.stock),
  };
}

export function productToRow(p: Omit<Product, "id">): Omit<SbProductRow, "id" | "created_at"> {
  return {
    slug: p.slug,
    name_en: p.nameEn,
    name_fi: p.nameFi,
    desc_en: p.descEn,
    desc_fi: p.descFi,
    price: p.price,
    old_price: p.oldPrice,
    unit: p.unit,
    category: p.category,
    image: p.image,
    badge: p.badge,
    best_seller: p.bestSeller,
    stock: p.stock,
  };
}

// ---------- Storefront reads (Supabase -> catalog fallback) ----------

export type ListFilters = {
  category?: string | null;
  q?: string | null;
  bestSellerOnly?: boolean;
  dealsOnly?: boolean;
};

export type ListResult = {
  products: Product[];
  source: "supabase" | "catalog";
};

export async function listProducts(filters: ListFilters = {}): Promise<ListResult> {
  try {
    const parts = ["select=*", "order=category.asc,price.asc"];
    if (filters.category) parts.push(`category=eq.${encodeURIComponent(filters.category)}`);
    if (filters.bestSellerOnly) parts.push("best_seller=eq.true");
    if (filters.dealsOnly) parts.push("old_price=not.is.null");
    if (filters.q) {
      const needle = filters.q.replace(/[(),*]/g, " ").trim();
      if (needle) {
        const like = encodeURIComponent(`*${needle}*`);
        parts.push(
          `or=(name_en.ilike.${like},name_fi.ilike.${like},desc_en.ilike.${like},desc_fi.ilike.${like})`
        );
      }
    }
    const rows = await sbFetch<SbProductRow[]>({ path: `/products?${parts.join("&")}` });
    return { products: rows.map(rowToProduct), source: "supabase" };
  } catch (err) {
    if (!(err instanceof SbError)) throw err;
    console.error(`[products] Supabase read failed (source: catalog): ${err.message}`);
  }

  let products = filterCatalog({ category: filters.category ?? null, q: filters.q ?? undefined });
  if (filters.bestSellerOnly) products = products.filter((p) => p.bestSeller);
  if (filters.dealsOnly) products = products.filter((p) => p.oldPrice != null);
  return { products, source: "catalog" };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rows = await sbFetch<SbProductRow[]>({
      path: `/products?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    });
    if (rows.length > 0) return rowToProduct(rows[0]);
  } catch (err) {
    if (!(err instanceof SbError)) throw err;
    console.error(`[products] Supabase read failed for "${slug}" (source: catalog): ${err.message}`);
  }
  return CATALOG.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  try {
    const rows = await sbFetch<SbProductRow[]>({
      path: `/products?select=*&id=in.(${ids.join(",")})`,
    });
    if (rows.length > 0) return rows.map(rowToProduct);
  } catch (err) {
    if (!(err instanceof SbError)) throw err;
    console.error(`[products] Supabase read by ids failed (source: catalog): ${err.message}`);
  }
  return CATALOG.filter((p) => ids.includes(p.id));
}

// ---------- Admin CRUD (Supabase only) ----------

export type ProductInput = Omit<Product, "id">;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "product";
}

async function ensureUniqueSlug(slug: string): Promise<string> {
  const rows = await sbFetch<{ id: number }[]>({
    path: `/products?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  });
  if (rows.length === 0) return slug;
  for (let n = 2; n < 100; n++) {
    const candidate = `${slug}-${n}`;
    const hits = await sbFetch<{ id: number }[]>({
      path: `/products?select=id&slug=eq.${encodeURIComponent(candidate)}&limit=1`,
    });
    if (hits.length === 0) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

export async function sbListAllProducts(): Promise<Product[]> {
  const rows = await sbFetch<SbProductRow[]>({
    path: "/products?select=*&order=id.asc",
    write: true,
  });
  return rows.map(rowToProduct);
}

export async function sbGetProductById(id: number): Promise<Product | null> {
  const rows = await sbFetch<SbProductRow[]>({
    path: `/products?select=*&id=eq.${id}&limit=1`,
    write: true,
  });
  return rows.length > 0 ? rowToProduct(rows[0]) : null;
}

export async function sbCreateProduct(input: ProductInput): Promise<Product> {
  // Always slugify whatever the client sent (idempotent for clean slugs).
  const slug = await ensureUniqueSlug(slugify(input.slug || input.nameEn));
  const row = productToRow({ ...input, slug });
  const created = await sbFetch<SbProductRow[]>({
    method: "POST",
    path: "/products?select=*",
    body: row,
    prefer: "return=representation",
    write: true,
  });
  return rowToProduct(created[0]);
}

export async function sbUpdateProduct(id: number, input: ProductInput): Promise<Product> {
  // Keep slug unique when it changed.
  const rows = await sbFetch<SbProductRow[]>({
    path: `/products?select=slug&id=eq.${id}&limit=1`,
    write: true,
  });
  if (rows.length === 0) throw new SbError("Product not found", 404);
  let slug = slugify(input.slug || input.nameEn);
  if (slug !== rows[0].slug) {
    slug = await ensureUniqueSlug(slug);
  }
  const row = productToRow({ ...input, slug });
  const updated = await sbFetch<SbProductRow[]>({
    method: "PATCH",
    path: `/products?select=*&id=eq.${id}`,
    body: row,
    prefer: "return=representation",
    write: true,
  });
  if (!updated || updated.length === 0) throw new SbError("Product not found", 404);
  return rowToProduct(updated[0]);
}

export async function sbDeleteProduct(id: number): Promise<void> {
  await sbFetch<null>({
    method: "DELETE",
    path: `/products?id=eq.${id}`,
    write: true,
  });
}

/** Upsert the static catalog into Supabase (idempotent, keyed on slug). */
export async function sbSeedFromCatalog(): Promise<number> {
  const rows = CATALOG.map(productToRow);
  await sbFetch<null>({
    method: "POST",
    path: "/products?on_conflict=slug",
    body: rows,
    prefer: "resolution=merge-duplicates",
    write: true,
  });
  const after = await sbFetch<SbProductRow[]>({ path: "/products?select=id", write: true });
  return after.length;
}

export function slugifyName(name: string): string {
  return slugify(name);
}
