"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgePercent } from "lucide-react";
import { ProductCard, type CardProduct } from "@/components/site/product-card";
import { useLanguage } from "@/components/site/language-provider";

type DealsProps = {
  /** Server-rendered initial data (static catalog) for instant paint + SEO. */
  products: CardProduct[];
};

export function Deals({ products: initial }: DealsProps) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<CardProduct[]>(initial);

  // Keep prices/flags in sync with the API (DB mode may differ from catalog).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/products?deals=true")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.products?.length) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-stone-50 py-20 dark:bg-stone-900/40 sm:py-24" aria-label={t.home.deals.title}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
            <BadgePercent className="h-4 w-4" aria-hidden="true" />
            {t.home.deals.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            {t.home.deals.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            {t.home.deals.subtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {products.slice(0, 6).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-stone-900 dark:text-emerald-300 dark:hover:bg-stone-800"
          >
            {t.home.deals.viewAll}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
