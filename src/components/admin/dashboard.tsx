"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Loader2,
  Package,
  PackageOpen,
  ReceiptText,
  RefreshCw,
  Star,
  Store,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SessionData = {
  connected: boolean;
  setupRequired: boolean;
  stats: {
    productCount: number;
    bestSellerCount: number;
    dealCount: number;
    lowStockCount: number;
    newOrders: number;
    totalOrders: number;
    revenueTotal: number;
  };
};

type RecentOrder = {
  id: number;
  order_no: string;
  customer_name: string;
  total: number | string;
  status: string;
  created_at: string;
  method: string;
};

const euro = (n: number) => `${n.toFixed(2)} €`;

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  accent: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full border-stone-200 transition-shadow group-hover:shadow-md">
        <CardContent className="flex items-start gap-4 p-5">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", accent)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-stone-900">{value}</p>
            {hint && <p className="mt-0.5 truncate text-xs text-stone-500">{hint}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AdminDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<SessionData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [refreshing, setRefreshing] = useState(true);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.ok) setData(await res.json());
      const ordersRes = await fetch("/api/admin/orders", { cache: "no-store" });
      if (ordersRes.ok) {
        const body = await ordersRes.json();
        setRecentOrders((body.orders ?? []).slice(0, 5));
      } else {
        setRecentOrders([]);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {greeting} 👋
          </h1>
          <p className="text-sm text-stone-500">Here is how your store is doing.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={refreshing} className="rounded-xl">
          <RefreshCw className={refreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* ---- Everything OK banner (only visible when something needs attention) ---- */}
      {data && !data.connected && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Your online store isn&apos;t connected yet.</p>
            <p>
              Products and orders aren&apos;t being saved. Please finish the one-time setup of your
              shop database — everything else already works.
            </p>
          </div>
        </div>
      )}
      {data && data.connected && stats && stats.lowStockCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
          <PackageOpen className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <div className="text-sm text-sky-900">
            <p className="font-semibold">
              {stats.lowStockCount} product{stats.lowStockCount > 1 ? "s are" : " is"} almost out of stock.
            </p>
            <p>
              Check the{" "}
              <Link href="/admin/products" className="font-semibold underline">
                Products
              </Link>{" "}
              page and update the stock numbers.
            </p>
          </div>
        </div>
      )}

      {/* ---- Stat cards ---- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="New orders"
          value={stats ? String(stats.newOrders) : "—"}
          hint={stats ? `${stats.totalOrders} orders in total` : undefined}
          accent="bg-amber-100 text-amber-700"
          href="/admin/orders"
        />
        <StatCard
          icon={Wallet}
          label="Total sales"
          value={stats ? euro(stats.revenueTotal) : "—"}
          hint="All orders, cancelled excluded"
          accent="bg-emerald-100 text-emerald-700"
          href="/admin/orders"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={stats ? String(stats.productCount) : "—"}
          hint={stats ? `${stats.dealCount} on sale` : undefined}
          accent="bg-stone-200 text-stone-700"
          href="/admin/products"
        />
        <StatCard
          icon={Star}
          label="Best sellers"
          value={stats ? String(stats.bestSellerCount) : "—"}
          hint="Shown on the homepage"
          accent="bg-rose-100 text-rose-700"
          href="/admin/products"
        />
      </div>

      {/* ---- Quick actions ---- */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/admin/products/new",
            icon: Package,
            title: "Add a product",
            text: "Photos, price, stock — live in the store right away.",
          },
          {
            href: "/admin/settings",
            icon: Store,
            title: "Update shop info",
            text: "Address, phone, opening hours and delivery fee.",
          },
          {
            href: "/admin/orders",
            icon: ReceiptText,
            title: "Handle orders",
            text: "See what customers ordered and mark orders done.",
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200 transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 font-semibold text-stone-900">
                {action.title}
                <ArrowRight className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </p>
              <p className="text-xs text-stone-500">{action.text}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ---- Recent orders ---- */}
      <Card className="border-stone-200">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-stone-900">Latest orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-emerald-700 hover:underline">
              View all
            </Link>
          </div>
          {refreshing && recentOrders.length === 0 ? (
            <p className="flex items-center gap-2 py-8 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading orders…
            </p>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <ChefHat className="h-8 w-8 text-stone-300" aria-hidden="true" />
              <p className="text-sm text-stone-500">No orders yet — they will appear here automatically.</p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {o.customer_name}
                      <span className="ml-2 text-xs font-normal text-stone-400">{o.order_no}</span>
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(o.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {o.method === "delivery" ? "Delivery" : "Pickup"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-stone-900">{Number(o.total).toFixed(2)} €</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        o.status === "new" ? "bg-amber-100 text-amber-800" : o.status === "done" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-500"
                      )}
                    >
                      {o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ---- Quiet reassurance ---- */}
      {data?.connected && (
        <p className="flex items-center gap-2 text-xs text-stone-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          Everything is running smoothly. Changes you make here appear in the store immediately.
          <BadgePercent className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
        </p>
      )}
    </div>
  );
}
