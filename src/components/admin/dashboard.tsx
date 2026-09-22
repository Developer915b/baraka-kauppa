"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Database,
  ExternalLink,
  Import,
  Loader2,
  Package,
  ReceiptText,
  RefreshCw,
  Tag,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SETUP_SQL = `-- Baraka Kauppa — Supabase setup (run ONCE)
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists public.products (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  slug        text not null unique,
  name_en     text not null,
  name_fi     text not null default '',
  desc_en     text not null default '',
  desc_fi     text not null default '',
  price       numeric(10,2) not null check (price >= 0),
  old_price   numeric(10,2) check (old_price is null or old_price >= 0),
  unit        text not null default '',
  category    text not null default 'asian',
  image       text not null default '/images/prod-rice.png',
  badge       text,
  best_seller boolean not null default false,
  stock       integer not null default 25 check (stock >= 0)
);

create table if not exists public.orders (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  order_no      text not null unique,
  customer_name text not null,
  phone         text not null,
  email         text,
  method        text not null check (method in ('delivery', 'pickup')),
  address       text, city text, postal_code text, notes text,
  items         jsonb not null default '[]'::jsonb,
  subtotal      numeric(10,2) not null default 0,
  delivery_fee  numeric(10,2) not null default 0,
  total         numeric(10,2) not null default 0,
  status        text not null default 'new' check (status in ('new','done','cancelled'))
);

alter table public.products enable row level security;
alter table public.orders   enable row level security;

drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select to anon using (true);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_best_seller_idx on public.products (best_seller);
create index if not exists orders_created_at_idx on public.orders (created_at desc);`;

type SessionData = {
  adminPasswordSet: boolean;
  supabase: {
    configured: boolean;
    canWrite: boolean;
    connected: boolean;
    setupRequired: boolean;
    message: string;
    productCount: number;
    catalogCount: number;
  };
  stats: { productCount: number; bestSellerCount: number; dealCount: number; lowStockCount: number };
};

type RecentOrder = {
  id: number;
  order_no: string;
  customer_name: string;
  total: number | string;
  status: string;
  created_at: string;
};

export function AdminDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<SessionData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.ok) setData(await res.json());
      const ordersRes = await fetch("/api/admin/orders", { cache: "no-store" });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setRecentOrders((data.orders ?? []).slice(0, 5));
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

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "SQL copied", description: "Paste it in the Supabase SQL Editor and press Run." });
    } catch {
      toast({ title: "Copy failed", description: "Select the SQL text manually and copy it." });
    }
  };

  const importProducts = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({
          title: "Products imported",
          description: `${body.count} products are now in your Supabase database.`,
        });
        await load();
      } else {
        toast({ title: "Import failed", description: body.error ?? "Please try again." });
      }
    } finally {
      setImporting(false);
    }
  };

  const sb = data?.supabase;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500">Everything about your store at a glance.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={refreshing} className="rounded-xl">
          <RefreshCw className={refreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* ---- Store database connection ---- */}
      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            Store database (Supabase)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sb || refreshing ? (
            <p className="flex items-center gap-2 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking connection…
            </p>
          ) : sb.connected ? (
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                Connected — your products are stored in Supabase and every change in the admin
                panel instantly shows up in the store.
              </p>
              <p className="text-sm text-stone-600">
                <span className="font-semibold">{sb.productCount}</span> products in the database
                {sb.catalogCount > 0 && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      onClick={importProducts}
                      disabled={importing}
                      className="font-semibold text-emerald-700 underline-offset-2 hover:underline disabled:opacity-60"
                    >
                      {importing
                        ? "Importing…"
                        : sb.productCount === 0
                          ? `Import the ${sb.catalogCount} built-in catalog products`
                          : `Re-import the ${sb.catalogCount} built-in catalog products`}
                    </button>
                  </>
                )}
              </p>
            </div>
          ) : sb.setupRequired ? (
            <div className="space-y-4">
              <p className="flex items-start gap-2 text-sm font-medium text-amber-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                One last step: the database tables don&apos;t exist yet. Run the SQL below in your
                Supabase dashboard (this takes ~10 seconds), then press Refresh.
              </p>
              <ol className="space-y-1.5 pl-1 text-sm text-stone-600">
                <li>1. Open your project at supabase.com → <strong>SQL Editor</strong> (left menu).</li>
                <li>2. Click <strong>New query</strong>, paste the SQL below, press <strong>Run</strong>.</li>
                <li>3. Come back here and press <strong>Refresh</strong> — then import your products.</li>
              </ol>
              <div className="relative">
                <pre className="max-h-64 overflow-auto rounded-xl bg-stone-900 p-4 text-xs leading-relaxed text-stone-100">
                  {SETUP_SQL}
                </pre>
                <Button
                  type="button"
                  size="sm"
                  onClick={copySql}
                  className="absolute right-3 top-3 rounded-lg bg-white text-stone-900 hover:bg-stone-200"
                >
                  {copied ? <Check className="mr-1.5 h-4 w-4" aria-hidden="true" /> : <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied" : "Copy SQL"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={load} variant="outline" size="sm" className="rounded-xl">
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Refresh
                </Button>
                <a
                  href="https://supabase.com/dashboard/project/_/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Open Supabase SQL Editor <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : (
            <p className="flex items-start gap-2 text-sm font-medium text-amber-800">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              {sb.message}. The store still works with its built-in catalog — but the admin panel
              needs Supabase to save changes. Check that SUPABASE_URL and the keys are set.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ---- Stats ---- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Products", value: data?.stats.productCount ?? 0, icon: Package, tone: "text-emerald-700 bg-emerald-50" },
          { label: "Best sellers", value: data?.stats.bestSellerCount ?? 0, icon: Tag, tone: "text-amber-700 bg-amber-50" },
          { label: "On sale", value: data?.stats.dealCount ?? 0, icon: Tag, tone: "text-red-700 bg-red-50" },
          { label: "Low stock (≤5)", value: data?.stats.lowStockCount ?? 0, icon: TriangleAlert, tone: "text-stone-700 bg-stone-200/60" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-stone-200">
              <CardContent className="flex items-center gap-4 p-5">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                  <p className="text-sm font-medium text-stone-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Recent orders ---- */}
        <Card className="border-stone-200">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              Recent orders
            </CardTitle>
            <Link href="/admin/orders" className="text-sm font-semibold text-emerald-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-stone-500">No orders yet. New orders appear here automatically.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-800">{o.order_no}</p>
                      <p className="truncate text-xs text-stone-500">{o.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900">{Number(o.total).toFixed(2)} €</p>
                      <p className={`text-xs font-semibold ${o.status === "new" ? "text-amber-600" : o.status === "done" ? "text-emerald-600" : "text-stone-400"}`}>
                        {o.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ---- Store settings (info) ---- */}
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Store settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-stone-600">
            <p className="flex justify-between gap-4">
              <span>Home delivery fee</span> <span className="font-semibold text-stone-900">4.90 €</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Free delivery from</span> <span className="font-semibold text-stone-900">40.00 €</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Store pickup</span> <span className="font-semibold text-stone-900">Always free</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Pickup address</span> <span className="text-right font-semibold text-stone-900">Kouvolankatu 34 A31, Kouvola</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Admin password</span>
              <span className="font-semibold text-stone-900">
                {data?.adminPasswordSet ? "Set (change via ADMIN_PASSWORD env var)" : "Not set!"}
              </span>
            </p>
            <p className="pt-1 text-xs leading-relaxed text-stone-400">
              Categories, badges and best sellers can be changed per product on the Products page.
              Discounts appear automatically when you set an old price higher than the current price.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
