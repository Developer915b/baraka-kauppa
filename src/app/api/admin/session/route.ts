import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, adminPasswordSet } from "@/lib/admin-auth";
import { sbCheckConnection, sbStatus } from "@/lib/supabase";
import { sbListAllProducts } from "@/lib/products";
import { sbFetch } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SbOrder = { status: string; total: number | string; created_at: string };

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = sbStatus();
  const connection = sb.configured
    ? await sbCheckConnection()
    : { connected: false, setupRequired: false, message: "The online store is not connected yet" };

  let productCount = 0;
  let bestSellerCount = 0;
  let dealCount = 0;
  let lowStockCount = 0;
  let newOrders = 0;
  let totalOrders = 0;
  let revenueTotal = 0;
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
    try {
      const orders = await sbFetch<SbOrder[]>({
        path: "/orders?select=status,total,created_at&order=created_at.desc&limit=500",
        write: true,
      });
      totalOrders = orders.length;
      newOrders = orders.filter((o) => o.status === "new").length;
      revenueTotal =
        Math.round(
          orders
            .filter((o) => o.status !== "cancelled")
            .reduce((sum, o) => sum + Number(o.total || 0), 0) * 100
        ) / 100;
    } catch {
      // orders stats stay zeroed
    }
  }

  return NextResponse.json({
    authed: true,
    adminPasswordSet: adminPasswordSet(),
    connected: connection.connected,
    setupRequired: connection.setupRequired,
    stats: {
      productCount,
      bestSellerCount,
      dealCount,
      lowStockCount,
      newOrders,
      totalOrders,
      revenueTotal,
    },
  });
}
