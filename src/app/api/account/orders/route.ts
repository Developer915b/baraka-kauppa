import { NextRequest, NextResponse } from "next/server";
import { sbFetch, SbError } from "@/lib/supabase";
import { getCustomerIdFromRequest } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

type OrderRow = {
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
  items: { productId: number; slug: string; name: string; price: number; qty: number; lineTotal: number }[];
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  status: string;
};

export async function GET(request: NextRequest) {
  const customerId = getCustomerIdFromRequest(request);
  if (!customerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    // Find the customer (for the email fallback match).
    const me = await sbFetch<{ email: string }[]>({
      path: `/customers?select=email&id=eq.${customerId}&limit=1`,
      write: true,
    });
    const email = me[0]?.email ?? "";

    // customer_id match when the upgraded schema is in place; email match
    // covers orders that were placed as a guest with the same address.
    const orParts = [`customer_id.eq.${customerId}`];
    if (email) orParts.push(`email.eq.${encodeURIComponent(email)}`);
    const path = `/orders?select=*&or=(${orParts.join(",")})&order=created_at.desc&limit=50`;

    let rows: OrderRow[];
    try {
      rows = await sbFetch<OrderRow[]>({ path, write: true });
    } catch (err) {
      if (err instanceof SbError && /customer_id/i.test(err.message) && email) {
        // Column not added yet — fall back to email matching only.
        rows = await sbFetch<OrderRow[]>({
          path: `/orders?select=*&email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=50`,
          write: true,
        });
      } else {
        throw err;
      }
    }

    return NextResponse.json({ orders: rows });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not load your orders" }, { status: 500 });
  }
}
