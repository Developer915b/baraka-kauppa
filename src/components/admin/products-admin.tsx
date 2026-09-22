"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Product = {
  id: number;
  slug: string;
  nameEn: string;
  nameFi: string;
  price: number;
  oldPrice: number | null;
  unit: string;
  category: string;
  image: string;
  badge: string | null;
  bestSeller: boolean;
  stock: number;
};

const CATEGORIES = [
  { key: "asian", label: "Asian Pantry" },
  { key: "chinese", label: "Chinese Kitchen" },
  { key: "thai", label: "Thai Essentials" },
  { key: "arabic", label: "Arabic & Middle East" },
  { key: "african", label: "African Flavours" },
  { key: "halal", label: "Halal Meat" },
  { key: "spices", label: "Spices & Pantry" },
];

export function ProductsAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setProducts(body.products);
      } else {
        setSetupRequired(Boolean(body.setupRequired));
        setError(body.error ?? "Failed to load products");
        setProducts([]);
      }
    } catch {
      setError("Could not reach the server");
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(needle) ||
          p.nameFi.toLowerCase().includes(needle) ||
          p.slug.includes(needle)
      );
    }
    return list;
  }, [products, category, query]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Product deleted", description: deleting.nameEn });
        setDeleting(null);
        await load();
      } else {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Delete failed", description: body.error ?? "Please try again." });
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  if (products === null) {
    return (
      <div className="flex items-center gap-2 py-16 text-stone-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading products…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Products</h1>
          <p className="text-sm text-stone-500">
            {products.length} products — edits appear in the store immediately.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New product
          </Link>
        </Button>
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
              and follow the 3-step Supabase setup. Until then, the store runs on the built-in
              catalog.
            </p>
          </div>
        </div>
      )}

      {error && !setupRequired && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-11 rounded-xl pl-9"
            aria-label="Search products"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-stone-500 ring-1 ring-stone-200">
          No products match. Try a different search or category.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => {
            const discounted = p.oldPrice != null && p.oldPrice > p.price;
            const pct = discounted && p.oldPrice != null ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
            const categoryLabel = CATEGORIES.find((c) => c.key === p.category)?.label ?? p.category;
            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200 sm:flex-row sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.nameEn}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-stone-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-semibold text-stone-900">{p.nameEn}</p>
                    {p.bestSeller && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Best seller</Badge>
                    )}
                    {discounted && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">−{pct}%</Badge>
                    )}
                    {p.badge && (
                      <Badge variant="outline" className="capitalize">
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {categoryLabel} · {p.unit || "no unit"} · stock {p.stock}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-emerald-800">{p.price.toFixed(2)} €</p>
                    {discounted && (
                      <p className="text-xs text-stone-400 line-through">{p.oldPrice?.toFixed(2)} €</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      aria-label={`Edit ${p.nameEn}`}
                    >
                      <Link href={`/admin/products/${p.id}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(p)}
                      aria-label={`Delete ${p.nameEn}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete confirmation */}
      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              “{deleting?.nameEn}” will be removed from the store permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteBusy}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {deleteBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
