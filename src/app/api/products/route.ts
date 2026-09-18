import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { filterCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["asian", "chinese", "thai", "arabic", "african", "halal", "spices"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  // 1) Try the database first (self-hosted / local deployments)
  const db = getDb();
  if (db) {
    try {
      const where: {
        active: boolean;
        category?: string;
        OR?: Array<{
          nameEn?: { contains: string };
          nameFi?: { contains: string };
          descEn?: { contains: string };
          descFi?: { contains: string };
        }>;
      } = { active: true };

      if (category && VALID_CATEGORIES.includes(category)) {
        where.category = category;
      }

      if (q) {
        const needle = q.toLowerCase();
        where.OR = [
          { nameEn: { contains: needle } },
          { nameFi: { contains: needle } },
          { descEn: { contains: needle } },
          { descFi: { contains: needle } },
        ];
      }

      const products = await db.product.findMany({
        where,
        orderBy: [{ category: "asc" }, { price: "asc" }],
        select: {
          id: true,
          slug: true,
          nameEn: true,
          nameFi: true,
          descEn: true,
          descFi: true,
          price: true,
          unit: true,
          category: true,
          image: true,
          badge: true,
          stock: true,
        },
      });

      return NextResponse.json({ products, source: "db" });
    } catch (error) {
      // Database unavailable (missing file / cold serverless env) -> fall through
      console.error("DB product query failed, using static catalog fallback:", error);
    }
  }

  // 2) Static catalog fallback (serverless deployments without a database)
  const products = filterCatalog({
    category: category && VALID_CATEGORIES.includes(category) ? category : null,
    q,
  });

  return NextResponse.json({ products, source: "catalog" });
}
