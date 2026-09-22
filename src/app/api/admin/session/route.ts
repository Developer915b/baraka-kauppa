import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, adminPasswordSet } from "@/lib/admin-auth";
import { sbCheckConnection, sbStatus } from "@/lib/supabase";
import { sbListAllProducts } from "@/lib/products";
import { CATALOG } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = sbStatus();
  const connection = sb.configured
    ? await sbCheckConnection()
    : { connected: false, setupRequired: false, message: "Supabase keys are not configured yet" };

  let productCount = 0;
  let bestSellerCount = 0;
  let dealCount = 0;
  let lowStockCount = 0;
  if (connection.connected) {
    try {
      const rows = await sbListAllProducts();
      productCount = rows.length;
      bestSellerCount = rows.filter((p) => p.bestSeller).length;
      dealCount = rows.filter((p) => p.oldPrice != null).length;
      lowStockCount = rows.filter((p) => p.stock <= 5).length;
    } catch {
      // connection state already reflects the problem
    }
  }

  return NextResponse.json({
    authed: true,
    adminPasswordSet: adminPasswordSet(),
    supabase: {
      ...sb,
      connected: connection.connected,
      setupRequired: connection.setupRequired,
      message: connection.message,
      productCount,
      catalogCount: CATALOG.length,
    },
    stats: { productCount, bestSellerCount, dealCount, lowStockCount },
  });
}
