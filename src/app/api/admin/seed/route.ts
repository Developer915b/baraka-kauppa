import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { sbSeedFromCatalog } from "@/lib/products";
import { SbError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Import / refresh the built-in catalog products into Supabase. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const count = await sbSeedFromCatalog();
    return NextResponse.json({ ok: true, count });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json(
        { error: err.message, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 });
  }
}
