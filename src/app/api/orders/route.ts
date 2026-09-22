import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCatalogProduct, type CatalogProduct } from "@/lib/catalog";
import { sbFetch, SbError } from "@/lib/supabase";
import { getProductsByIds } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { getCustomerIdFromRequest } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

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

type DbLikeProduct = {
  id: number;
  slug: string;
  nameEn: string;
  price: number;
};

type Totals = {
  orderItems: OrderItemPayload[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

function computeTotals(
  products: (DbLikeProduct | CatalogProduct)[],
  cleanItems: IncomingItem[],
  method: string,
  deliveryFee: number,
  freeThreshold: number
): Totals | { error: string } {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderItems: OrderItemPayload[] = [];

  for (const it of cleanItems) {
    const p = productMap.get(it.productId);
    if (!p) {
      return { error: `Product ${it.productId} is not available` };
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
  const fee =
    method === "delivery" && subtotal < freeThreshold ? deliveryFee : 0;
  const total = Math.round((subtotal + fee) * 100) / 100;

  return { orderItems, subtotal, deliveryFee: fee, total };
}

function generateOrderNo(): string {
  return `BK-${Date.now().toString(36).toUpperCase()}${Math.floor(
    Math.random() * 90 + 10
  )}`;
}

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

    // Owner-editable shop settings (delivery fee etc.), served from cache.
    const settings = await getSettings();
    const customerData = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      address: method === "delivery" ? address.trim() : null,
      city: method === "delivery" ? city.trim() : null,
      postalCode: method === "delivery" ? postalCode.trim() : null,
      method,
      notes: notes ? String(notes).trim().slice(0, 500) : null,
    };

    const orderNo = generateOrderNo();

    // --- Path 1: persist to Supabase when configured (works on any host) ---
    try {
      const sbProducts = await getProductsByIds(cleanItems.map((it) => it.productId));
      if (sbProducts.length > 0) {
        const totals = computeTotals(
          sbProducts,
          cleanItems,
          method,
          settings.deliveryFee,
          settings.freeDeliveryThreshold
        );
        if ("error" in totals) {
          return NextResponse.json({ error: totals.error }, { status: 400 });
        }

        // Attach the signed-in customer account when there is one. The
        // customer_id column comes from the upgrade SQL; if it is not there
        // yet we simply save the order without it.
        const customerId = getCustomerIdFromRequest(request);
        const orderRow: Record<string, unknown> = {
          order_no: orderNo,
          customer_name: customerData.customerName,
          phone: customerData.phone,
          email: customerData.email,
          method: customerData.method,
          address: customerData.address,
          city: customerData.city,
          postal_code: customerData.postalCode,
          notes: customerData.notes,
          items: totals.orderItems,
          subtotal: totals.subtotal,
          delivery_fee: totals.deliveryFee,
          total: totals.total,
          status: "new",
        };
        if (customerId) orderRow.customer_id = customerId;
        try {
          await sbFetch<null>({ method: "POST", path: "/orders", body: orderRow, write: true });
        } catch (colErr) {
          if (customerId && colErr instanceof SbError && /customer_id/i.test(colErr.message)) {
            delete orderRow.customer_id;
            await sbFetch<null>({ method: "POST", path: "/orders", body: orderRow, write: true });
          } else {
            throw colErr;
          }
        }

        return NextResponse.json({
          ok: true,
          persisted: true,
          orderNo,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          itemCount: totals.orderItems.reduce((n, it) => n + it.qty, 0),
        });
      }
    } catch (error) {
      console.error("Supabase order write failed, trying local DB fallback:", error);
    }

    // --- Path 2: persist to local SQLite database when available (self-hosted) ---
    const db = getDb();
    if (db) {
      try {
        const ids = cleanItems.map((it) => it.productId);
        const dbProducts = await db.product.findMany({
          where: { id: { in: ids }, active: true },
        });

        const totals = computeTotals(
          dbProducts,
          cleanItems,
          method,
          settings.deliveryFee,
          settings.freeDeliveryThreshold
        );
        if ("error" in totals) {
          return NextResponse.json({ error: totals.error }, { status: 400 });
        }

        await db.order.create({
          data: {
            orderNo,
            ...customerData,
            subtotal: totals.subtotal,
            deliveryFee: totals.deliveryFee,
            total: totals.total,
            items: JSON.stringify(totals.orderItems),
          },
        });

        return NextResponse.json({
          ok: true,
          persisted: true,
          orderNo,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          itemCount: totals.orderItems.reduce((n, it) => n + it.qty, 0),
        });
      } catch (error) {
        console.error("DB order write failed, falling back to catalog mode:", error);
      }
    }

    // --- Path 3: serverless mode (no database) — validate + price from the
    // static catalog. The order is confirmed to the customer and delivered to
    // the shop owner via the Netlify Form submission made by the client. ---
    const resolved: DbLikeProduct[] = [];
    for (const it of cleanItems) {
      const p = getCatalogProduct(it.productId);
      if (!p) {
        return NextResponse.json(
          { error: `Product ${it.productId} is not available` },
          { status: 400 }
        );
      }
      resolved.push({ id: p.id, slug: p.slug, nameEn: p.nameEn, price: p.price });
    }
    const catalogTotals = computeTotals(
      resolved,
      cleanItems,
      method,
      settings.deliveryFee,
      settings.freeDeliveryThreshold
    );
    if ("error" in catalogTotals) {
      return NextResponse.json({ error: catalogTotals.error }, { status: 400 });
    }

    console.log(
      `[order][catalog] ${orderNo} — ${customerData.customerName} (${customerData.phone}) — ${catalogTotals.total} €`
    );

    return NextResponse.json({
      ok: true,
      persisted: false,
      orderNo,
      subtotal: catalogTotals.subtotal,
      deliveryFee: catalogTotals.deliveryFee,
      total: catalogTotals.total,
      itemCount: catalogTotals.orderItems.reduce((n, it) => n + it.qty, 0),
    });
  } catch (error) {
    console.error("POST /api/orders failed:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
