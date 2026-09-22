"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";
import { cn } from "@/lib/utils";

export type AccountCustomer = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string | null;
};

type OrderItem = { productId: number; slug: string; name: string; price: number; qty: number; lineTotal: number };

type AccountOrder = {
  id: number;
  created_at: string;
  order_no: string;
  customer_name: string;
  method: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  items: OrderItem[];
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  status: string;
};

const euro = (n: number | string) => `${Number(n).toFixed(2)} €`;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-500",
};

export function AccountView({ customer }: { customer: AccountCustomer }) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/orders", { cache: "no-store" });
        if (res.ok) {
          const body = await res.json();
          setOrders(body.orders ?? []);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      }
    })();
  }, []);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  };

  const statusLabel = (status: string) => {
    if (locale === "fi") {
      return status === "done" ? "Valmis" : status === "cancelled" ? "Peruttu" : "Uusi";
    }
    return status === "done" ? "Completed" : status === "cancelled" ? "Cancelled" : "New";
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-20 pt-10">
      {/* Profile card */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white">
              <UserRound className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                {t.account.welcome}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">{customer.name}</h1>
              <p className="text-xs text-stone-500">
                {t.account.memberSince}
                {customer.createdAt
                  ? ` · ${new Date(customer.createdAt).toLocaleDateString(locale === "fi" ? "fi-FI" : "en-GB", {
                      month: "short",
                      year: "numeric",
                    })}`
                  : ""}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={signOut}
            disabled={signingOut}
            className="h-10 rounded-xl border-stone-300 font-semibold text-stone-700 hover:bg-red-50 hover:text-red-700"
          >
            {signingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {t.account.signOut}
          </Button>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <dd className="truncate font-medium text-stone-700">{customer.email}</dd>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-4 py-3">
              <Phone className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <dd className="font-medium text-stone-700">{customer.phone}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Order history */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <h2 className="flex items-center gap-2 font-bold text-stone-900">
          <ReceiptText className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          {t.account.orderHistory}
        </h2>

        {orders === null ? (
          <p className="flex items-center gap-2 py-10 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t.account.processing}
          </p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Package className="h-8 w-8 text-stone-300" aria-hidden="true" />
            <p className="text-sm text-stone-500">{t.account.noOrders}</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl ring-1 ring-stone-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-stone-900">
                      {t.account.orderNo} {o.order_no}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(o.created_at).toLocaleString(locale === "fi" ? "fi-FI" : "en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        STATUS_STYLES[o.status] ?? "bg-stone-200 text-stone-500"
                      )}
                    >
                      {statusLabel(o.status)}
                    </span>
                    <span className="text-base font-bold text-stone-900">{euro(o.total)}</span>
                  </div>
                </div>
                <div className="space-y-3 px-4 py-3">
                  <ul className="space-y-1 text-sm text-stone-600">
                    {(Array.isArray(o.items) ? o.items : []).map((it) => (
                      <li key={`${o.id}-${it.productId}`} className="flex justify-between gap-3">
                        <span>
                          {it.qty} × {it.name}
                        </span>
                        <span className="font-medium text-stone-800">{euro(it.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="flex items-center gap-1.5 text-xs text-stone-500">
                    {o.method === "delivery" ? (
                      <>
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {o.address}, {o.postal_code} {o.city}
                      </>
                    ) : (
                      t.checkout.pickup
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
