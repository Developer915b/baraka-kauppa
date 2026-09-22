import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { sbUpdateProduct, sbDeleteProduct } from "@/lib/products";
import { normaliseInput } from "@/lib/product-input";
import { SbError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await ctx.params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const input = normaliseInput(body);
    if ("error" in input) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }
    const product = await sbUpdateProduct(id, input);
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json(
        { error: err.message, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await ctx.params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  try {
    await sbDeleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json(
        { error: err.message, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
