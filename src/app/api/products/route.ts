import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["asian", "chinese", "thai", "arabic", "african", "halal", "spices"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const q = searchParams.get("q")?.trim() ?? null;

  const { products, source } = await listProducts({
    category: categoryParam && VALID_CATEGORIES.includes(categoryParam) ? categoryParam : null,
    q,
    bestSellerOnly: searchParams.get("bestseller") === "true",
    dealsOnly: searchParams.get("deals") === "true",
  });

  // Short CDN cache (Netlify) on top of the in-memory server cache — keeps
  // database reads low while prices stay fresh within 30 s.
  const res = NextResponse.json({ products, source });
  res.headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=30, stale-while-revalidate=60"
  );
  return res;
}
