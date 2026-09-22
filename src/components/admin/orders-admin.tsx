"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, ReceiptText, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type OrderItem = { productId: number; slug: string; name: string; price: number; qty: number; lineTotal: number };

type Order = {
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
  items: OrderItem[];
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-500",
};

export function OrdersAdmin() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setOrders(body.orders);
      } else {
        setSetupRequired(Boolean(body.setupRequired));
        setError(body.error ?? "Failed to load orders");
        setOrders([]);
      }
    } catch {
      setError("Could not reach the server");
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (order: Order, status: string) => {
    setUpdating(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((list) => (list ?? []).map((o) => (o.id === order.id ? { ...o, status } : o)));
        toast({ title: "Order updated", description: `${order.order_no} marked as ${status}.` });
      } else {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Update failed", description: body.error ?? "Please try again." });
      }
    } finally {
      setUpdating(null);
    }
  };

  if (orders === null) {
    return (
      <div className="flex items-center gap-2 py-16 text-stone-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading orders…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Orders</h1>
        <p className="text-sm text-stone-500">The latest 100 orders, newest first.</p>
      </div>

      {setupRequired && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Database not set up yet.</p>
            <p>
              Open the{" "}
              <Link href="/admin/dashboard" className="font-semibold underline">
                Dashboard
              </Link>{" "}
              and follow the 3-step Supabase setup to start collecting orders here.
            </p>
          </div>
        </div>
      )}

      {error && !setupRequired && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      {orders.length === 0 && !error ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
          <ReceiptText className="mx-auto h-10 w-10 text-stone-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-stone-500">No orders yet. They will appear here automatically.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            const open = openId === o.id;
            return (
              <li key={o.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : o.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={open}
                  >
                    <ChevronDown className={cn("h-5 w-5 shrink-0 text-stone-400 transition-transform", open && "rotate-180")} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900">{o.order_no}</p>
                      <p className="truncate text-xs text-stone-500">
                        {o.customer_name} · {new Date(o.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold text-stone-900">{Number(o.total).toFixed(2)} €</p>
                      <p className="text-xs font-medium text-stone-500">{o.method === "delivery" ? "Delivery" : "Pickup"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("capitalize", STATUS_STYLES[o.status] ?? "bg-stone-200")}>{o.status}</Badge>
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o, e.target.value)}
                        disabled={updating === o.id}
                        aria-label={`Change status of ${o.order_no}`}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="new">new</option>
                        <option value="done">done</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-stone-100 bg-stone-50 px-4 py-4 text-sm">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="font-semibold text-stone-700">Items</p>
                        <ul className="mt-1.5 space-y-1 text-stone-600">
                          {items.map((it) => (
                            <li key={`${o.id}-${it.productId}`} className="flex justify-between gap-3">
                              <span>{it.qty} × {it.name}</span>
                              <span className="font-medium text-stone-800">{Number(it.lineTotal).toFixed(2)} €</span>
                            </li>
                          ))}
                        </ul>
                        <dl className="mt-3 space-y-1 border-t border-stone-200 pt-2 text-stone-600">
                          <div className="flex justify-between"><dt>Subtotal</dt><dd>{Number(o.subtotal).toFixed(2)} €</dd></div>
                          <div className="flex justify-between"><dt>Delivery</dt><dd>{Number(o.delivery_fee).toFixed(2)} €</dd></div>
                          <div className="flex justify-between font-bold text-stone-900"><dt>Total</dt><dd>{Number(o.total).toFixed(2)} €</dd></div>
                        </dl>
                      </div>
                      <div>
                        <p className="font-semibold text-stone-700">Customer</p>
                        <p className="mt-1.5 text-stone-600">{o.customer_name}</p>
                        <p className="text-stone-600">{o.phone}{o.email ? ` · ${o.email}` : ""}</p>
                        {o.method === "delivery" ? (
                          <p className="mt-1 text-stone-600">{o.address}, {o.postal_code} {o.city}</p>
                        ) : (
                          <p className="mt-1 text-stone-600">Pickup at the store</p>
                        )}
                        {o.notes && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">Note: {o.notes}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
