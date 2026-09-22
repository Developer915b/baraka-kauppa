import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { SbError, sbFetch } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export type SbOrderRow = {
  id: number;
  created_at: string;
  order_no: string;
  customer_name: string;
  phone: string;
  email: string | null;
  method: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
  items: Array<{
    productId: number;
    slug: string;
    name: string;
    price: number;
    qty: number;
    lineTotal: number;
  }>;
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  status: string;
};

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const orders = await sbFetch<SbOrderRow[]>({
      path: "/orders?select=*&order=created_at.desc&limit=100",
      write: true,
    });
    return NextResponse.json({ orders });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json(
        { error: err.message, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
