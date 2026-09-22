import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { SbError, sbFetch } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await ctx.params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const status = String(body?.status ?? "");
    if (!["new", "done", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Status must be new, done or cancelled" }, { status: 400 });
    }
    await sbFetch<null>({
      method: "PATCH",
      path: `/orders?id=eq.${id}`,
      body: { status },
      write: true,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json(
        { error: err.message, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
