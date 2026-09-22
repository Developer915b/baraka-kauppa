import { NextRequest, NextResponse } from "next/server";
import { sbFetch } from "@/lib/supabase";
import { getCustomerIdFromRequest } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

type CustomerRow = { id: number; email: string; name: string; phone: string | null };

export async function GET(request: NextRequest) {
  const id = getCustomerIdFromRequest(request);
  if (!id) return NextResponse.json({ customer: null });
  try {
    const rows = await sbFetch<CustomerRow[]>({
      path: `/customers?select=id,email,name,phone&id=eq.${id}&limit=1`,
      write: true,
    });
    return NextResponse.json({ customer: rows[0] ?? null });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
