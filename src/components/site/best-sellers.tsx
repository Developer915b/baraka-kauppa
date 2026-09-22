"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { ProductCard, type CardProduct } from "@/components/site/product-card";
import { useLanguage } from "@/components/site/language-provider";
import { getCachedJson, setCachedJson } from "@/lib/client-cache";

type BestSellersProps = {
  /** Server-rendered initial data (static catalog) for instant paint + SEO. */
  products: CardProduct[];
};

export function BestSellers({ products: initial }: BestSellersProps) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<CardProduct[]>(initial);

  // Keep prices/flags in sync with the API (DB mode may differ from catalog).
  // 30 s client cache + focus revalidation keeps repeat visits instant and
  // current without extra database reads.
  useEffect(() => {
    let cancelled = false;
    const CACHE_KEY = "GET /api/products?bestseller=true";
    const apply = (data: { products?: CardProduct[] } | null) => {
      if (!cancelled && data?.products?.length) setProducts(data.products);
    };
    const fetchAndApply = () => {
      fetch("/api/products?bestseller=true")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setCachedJson(CACHE_KEY, data);
          apply(data);
        })
        .catch(() => {});
    };
    apply(getCachedJson<{ products?: CardProduct[] }>(CACHE_KEY, 30_000) ?? null);
    fetchAndApply();
    window.addEventListener("focus", fetchAndApply);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", fetchAndApply);
    };
  }, []);

  return (
    <section className="bg-white py-20 dark:bg-stone-950 sm:py-24" aria-label={t.home.bestSellers.title}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4" aria-hidden="true" />
            {t.home.bestSellers.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            {t.home.bestSellers.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            {t.home.bestSellers.subtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            {t.home.bestSellers.viewAll}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
