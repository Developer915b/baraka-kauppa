"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShoppingCart, PackageSearch, RefreshCw, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";
import { useCart } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ApiProduct = {
  id: number;
  slug: string;
  nameEn: string;
  nameFi: string;
  descEn: string;
  descFi: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  badge: string | null;
  stock: number;
};

const CATEGORY_KEYS = [
  "asian",
  "chinese",
  "thai",
  "arabic",
  "african",
  "halal",
  "spices",
] as const;

const BADGE_STYLES: Record<string, string> = {
  popular: "bg-amber-400 text-emerald-950",
  new: "bg-emerald-600 text-white",
  fresh: "bg-lime-600 text-white",
};

export function Shop() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.openCart);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync the active tab with ?category= deep links (e.g. from category cards)
  useEffect(() => {
    if (
      categoryParam &&
      (CATEGORY_KEYS as readonly string[]).includes(categoryParam)
    ) {
      setCategory(categoryParam);
    } else if (!categoryParam) {
      setCategory("all");
    }
  }, [categoryParam]);

  const load = async (cat: string, q: string) => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (cat !== "all") params.set("category", cat);
      if (q) params.set("q", q);
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(category, query), query ? 300 : 0);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [category, query]);

  const handleAdd = (p: ApiProduct) => {
    addItem({
      productId: p.id,
      slug: p.slug,
      nameEn: p.nameEn,
      nameFi: p.nameFi,
      price: p.price,
      image: p.image,
      unit: p.unit,
    });
    setJustAdded(p.id);
    setTimeout(() => setJustAdded(null), 1200);
    toast({
      title: t.cart.addedToCart,
      description: locale === "fi" ? p.nameFi : p.nameEn,
      action: (
        <Button size="sm" variant="outline" onClick={openCart} className="h-8">
          {t.cart.title}
        </Button>
      ),
    });
  };

  const isFiltering = useMemo(() => category !== "all" || query.length > 0, [category, query]);

  return (
    <section id="shop" className="scroll-mt-20 bg-stone-50 py-20 dark:bg-stone-900/40 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {t.shop.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            {t.shop.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            {t.shop.subtitle}
          </p>
        </motion.div>

        {/* Search + category filter */}
        <div className="mt-10 flex flex-col gap-4">
          <div className="relative mx-auto w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.shop.searchPlaceholder}
              aria-label={t.shop.searchLabel}
              className="h-12 rounded-full border-stone-200 bg-white pl-12 pr-4 text-base shadow-sm focus-visible:ring-emerald-600 dark:border-stone-700 dark:bg-stone-900"
            />
          </div>

          <div
            className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
            role="tablist"
            aria-label={t.shop.label}
          >
            {(["all", ...CATEGORY_KEYS] as const).map((key) => {
              const active = category === key;
              const label = key === "all" ? t.shop.all : t.shop.categories[key];
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(key)}
                  className={cn(
                    "shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2",
                    active
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700 dark:hover:bg-stone-800 dark:hover:text-emerald-200"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-stone-900"
              >
                <div className="aspect-square animate-pulse bg-stone-200 dark:bg-stone-800" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-stone-900">
            <PackageSearch className="h-10 w-10 text-stone-400" aria-hidden="true" />
            <p className="text-stone-600 dark:text-stone-300">{t.shop.loadError}</p>
            <Button
              onClick={() => load(category, query)}
              variant="outline"
              className="rounded-full border-emerald-700/40 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-stone-800"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              {t.shop.retry}
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-2 rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-stone-900">
            <PackageSearch className="h-10 w-10 text-stone-400" aria-hidden="true" />
            <p className="text-lg font-semibold text-stone-800 dark:text-stone-100">
              {t.shop.noResults}
            </p>
            <p className="max-w-md text-sm text-stone-500 dark:text-stone-400">
              {t.shop.noResultsHint}
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((p, i) => {
              const name = locale === "fi" ? p.nameFi : p.nameEn;
              const desc = locale === "fi" ? p.descFi : p.descEn;
              const added = justAdded === p.id;
              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: Math.min(i % 4, 3) * 0.06 }}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-stone-900 dark:ring-stone-800"
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={p.image}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.badge && BADGE_STYLES[p.badge] && (
                      <span
                        className={cn(
                          "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow",
                          BADGE_STYLES[p.badge]
                        )}
                      >
                        {t.shop.badges[p.badge as keyof typeof t.shop.badges] ?? p.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900 dark:text-stone-100 sm:text-base">
                      {name}
                    </h3>
                    <p className="mt-1 line-clamp-2 hidden text-xs leading-relaxed text-stone-500 dark:text-stone-400 sm:block">
                      {desc}
                    </p>
                    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{p.unit}</p>
                    {/* Price + add button: stacked on mobile (no clipped text),
                        row on larger screens */}
                    <div className="mt-auto flex flex-col gap-2.5 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="whitespace-nowrap text-lg font-bold text-emerald-800 dark:text-emerald-300">
                        {p.price.toFixed(2).replace(".", ",")} €
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(p)}
                        disabled={p.stock <= 0}
                        aria-label={`${t.shop.addToCart}: ${name}`}
                        className={cn(
                          "h-10 w-full justify-center rounded-full px-3 text-xs font-semibold transition-colors sm:w-auto sm:px-4 sm:text-sm",
                          added
                            ? "bg-lime-600 text-white hover:bg-lime-600"
                            : "bg-emerald-700 text-white hover:bg-emerald-800"
                        )}
                      >
                        {added ? (
                          <>
                            <Check className="mr-1 h-4 w-4" aria-hidden="true" />
                            {t.shop.added}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-1 h-4 w-4" aria-hidden="true" />
                            {t.shop.addToCart}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* invisible helper so isFiltering is used for a11y hint */}
        <p className="sr-only" aria-live="polite">
          {isFiltering ? `${products.length} results` : ""}
        </p>
      </div>
    </section>
  );
}
