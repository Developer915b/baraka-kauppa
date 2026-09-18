import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["asian", "chinese", "thai", "arabic", "african", "halal", "spices"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.trim();

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

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products failed:", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
