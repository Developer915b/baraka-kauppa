import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DELIVERY_FEE = 4.9;
const FREE_DELIVERY_THRESHOLD = 40;

type IncomingItem = {
  productId: number;
  qty: number;
};

type OrderItemPayload = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  qty: number;
  lineTotal: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      phone,
      email,
      address,
      city,
      postalCode,
      method,
      notes,
      items,
    } = body ?? {};

    // --- Validation ---
    if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 6) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (method !== "delivery" && method !== "pickup") {
      return NextResponse.json({ error: "Method must be delivery or pickup" }, { status: 400 });
    }
    if (method === "delivery") {
      if (!address || typeof address !== "string" || address.trim().length < 4) {
        return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
      }
      if (!city || !postalCode) {
        return NextResponse.json({ error: "City and postal code are required" }, { status: 400 });
      }
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Sanitise quantities
    const cleanItems: IncomingItem[] = items
      .map((it: IncomingItem) => ({
        productId: Number(it.productId),
        qty: Math.min(Math.max(Math.floor(Number(it.qty)), 1), 99),
      }))
      .filter((it) => Number.isInteger(it.productId) && it.productId > 0);

    if (cleanItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Load products and compute totals server-side (never trust client prices)
    const ids = cleanItems.map((it) => it.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: ids }, active: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const orderItems: OrderItemPayload[] = [];

    for (const it of cleanItems) {
      const p = productMap.get(it.productId);
      if (!p) {
        return NextResponse.json(
          { error: `Product ${it.productId} is not available` },
          { status: 400 }
        );
      }
      orderItems.push({
        productId: p.id,
        slug: p.slug,
        name: p.nameEn,
        price: p.price,
        qty: it.qty,
        lineTotal: Math.round(p.price * it.qty * 100) / 100,
      });
    }

    const subtotal =
      Math.round(orderItems.reduce((sum, it) => sum + it.lineTotal, 0) * 100) / 100;
    const deliveryFee =
      method === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;

    // Human-friendly order number
    const orderNo = `BK-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 90 + 10
    )}`;

    const order = await db.order.create({
      data: {
        orderNo,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        address: method === "delivery" ? address.trim() : null,
        city: method === "delivery" ? city.trim() : null,
        postalCode: method === "delivery" ? postalCode.trim() : null,
        method,
        notes: notes ? String(notes).trim().slice(0, 500) : null,
        subtotal,
        deliveryFee,
        total,
        items: JSON.stringify(orderItems),
      },
    });

    return NextResponse.json({
      ok: true,
      orderNo: order.orderNo,
      subtotal,
      deliveryFee,
      total,
      itemCount: orderItems.reduce((n, it) => n + it.qty, 0),
    });
  } catch (error) {
    console.error("POST /api/orders failed:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
