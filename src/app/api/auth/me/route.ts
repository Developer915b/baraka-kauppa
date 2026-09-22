import { NextRequest, NextResponse } from "next/server";
import { sbFetch, sbStatus } from "@/lib/supabase";
import { getCustomerIdFromRequest } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

type CustomerRow = { id: number; email: string; name: string; phone: string | null };

export async function GET(request: NextRequest) {
  // Accounts work when the Supabase secret key is configured (needed for the
  // login/register queries). When it is not, the storefront silently falls
  // back to guest checkout so the shop never breaks.
  const authAvailable = sbStatus().canWrite;

  const id = getCustomerIdFromRequest(request);
  if (!id) return NextResponse.json({ customer: null, authAvailable });
  try {
    const rows = await sbFetch<CustomerRow[]>({
      path: `/customers?select=id,email,name,phone&id=eq.${id}&limit=1`,
      write: true,
    });
    return NextResponse.json({ customer: rows[0] ?? null, authAvailable });
  } catch {
    return NextResponse.json({ customer: null, authAvailable });
  }
}
