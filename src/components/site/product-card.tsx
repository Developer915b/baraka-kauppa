"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";
import { useCart } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type CardProduct = {
  id: number;
  slug: string;
  nameEn: string;
  nameFi: string;
  descEn: string;
  descFi: string;
  price: number;
  oldPrice: number | null;
  unit: string;
  image: string;
  badge: string | null;
  stock: number;
};

const BADGE_STYLES: Record<string, string> = {
  popular: "bg-amber-400 text-emerald-950",
  new: "bg-emerald-600 text-white",
  fresh: "bg-lime-600 text-white",
};

type ProductCardProps = {
  product: CardProduct;
  /** Position inside the grid — used only to stagger the entrance animation. */
  index?: number;
  className?: string;
};

/**
 * Shared product card for the shop grid, homepage best-sellers, deals and
 * related-product sections. The image + title link to the product detail
 * page; the add-to-cart button stays outside the link (valid nesting).
 */
export function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.openCart);
  const [added, setAdded] = useState(false);

  const name = locale === "fi" ? product.nameFi : product.nameEn;
  const desc = locale === "fi" ? product.descFi : product.descEn;
  const oldPrice = product.oldPrice;
  const discounted = oldPrice != null && oldPrice > product.price;
  const discountPct = discounted
    ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      nameFi: product.nameFi,
      price: product.price,
      image: product.image,
      unit: product.unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    toast({
      title: t.cart.addedToCart,
      description: name,
      action: (
        <Button size="sm" variant="outline" onClick={openCart} className="h-8">
          {t.cart.title}
        </Button>
      ),
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index % 4, 3) * 0.06 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-stone-900 dark:ring-stone-800",
        className
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800"
        aria-label={name}
      >
        <img
          src={product.image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && BADGE_STYLES[product.badge] && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow",
              BADGE_STYLES[product.badge]
            )}
          >
            {t.shop.badges[product.badge as keyof typeof t.shop.badges] ?? product.badge}
          </span>
        )}
        {discounted && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            −{discountPct}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug sm:text-base">
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-stone-900 transition-colors hover:text-emerald-800 dark:text-stone-100 dark:hover:text-emerald-300"
          >
            {name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 hidden text-xs leading-relaxed text-stone-500 dark:text-stone-400 sm:block">
          {desc}
        </p>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{product.unit}</p>

        {/* Price + add button: stacked on mobile (no clipped text),
            row on larger screens */}
        <div className="mt-auto flex flex-col gap-2.5 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="whitespace-nowrap text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {product.price.toFixed(2)} €
            </span>
            {discounted && (
              <span className="whitespace-nowrap text-sm text-stone-400 line-through dark:text-stone-500">
                {oldPrice.toFixed(2)} €
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={product.stock <= 0}
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
}
