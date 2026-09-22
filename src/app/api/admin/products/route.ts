import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { sbListAllProducts, sbCreateProduct } from "@/lib/products";
import { normaliseInput } from "@/lib/product-input";
import { SbError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const products = await sbListAllProducts();
    return NextResponse.json({ products });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json(
        { error: err.message, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const input = normaliseInput(body);
    if ("error" in input) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }
    const product = await sbCreateProduct(input);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json(
        { error: err.message, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
