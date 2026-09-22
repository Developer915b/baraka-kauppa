"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  ExternalLink,
  LogOut,
  Menu,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/settings", label: "Site settings", icon: Store },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin");
    router.refresh();
  };

  const navItem = (item: (typeof NAV)[number]) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMenuOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
          active
            ? "bg-emerald-700 text-white shadow-sm"
            : "text-stone-600 hover:bg-emerald-50 hover:text-emerald-800"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {item.label}
      </Link>
    );
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-stone-100">
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-bold text-stone-900">Admin</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle admin menu"
          aria-expanded={menuOpen}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      {menuOpen && (
        <nav className="border-b border-stone-200 bg-white px-4 py-3 lg:hidden" aria-label="Admin navigation">
          <div className="space-y-1">
            {NAV.map(navItem)}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-emerald-50"
            >
              <ExternalLink className="h-5 w-5 shrink-0" aria-hidden="true" />
              View store
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </nav>
      )}

      <div className="mx-auto flex w-full max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-stone-200 bg-white px-4 py-6 lg:flex">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold text-stone-900">Admin Panel</span>
              <span className="text-xs font-medium text-stone-400">Baraka Kauppa</span>
            </span>
          </Link>

          <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Admin navigation">
            {NAV.map(navItem)}
            <Link
              href="/"
              target="_blank"
              className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-500 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <ExternalLink className="h-5 w-5 shrink-0" aria-hidden="true" />
              View store
            </Link>
          </nav>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
