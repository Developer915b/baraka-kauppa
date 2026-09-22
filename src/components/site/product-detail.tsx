"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Truck,
  Store,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/site/language-provider";
import { useSettings } from "@/components/site/settings-provider";
import { useCart } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { ProductCard, type CardProduct } from "@/components/site/product-card";
import { cn } from "@/lib/utils";

export type ProductDetailData = CardProduct & {
  category: string;
  bestSeller: boolean;
  /** Extra gallery photos (cover is `image`). */
  images?: string[];
};

const BADGE_STYLES: Record<string, string> = {
  popular: "bg-amber-400 text-emerald-950",
  new: "bg-emerald-600 text-white",
  fresh: "bg-lime-600 text-white",
};

type ProductDetailProps = {
  product: ProductDetailData;
  related: CardProduct[];
};

export function ProductDetail({ product, related }: ProductDetailProps) {
  const { t, locale } = useLanguage();
  const settings = useSettings();
  const [photo, setPhoto] = useState(product.image);
  const gallery = product.images && product.images.length > 0
    ? [product.image, ...product.images.filter((u) => u !== product.image)]
    : [product.image];
  const deliveryInfo = (s: string) =>
    s
      .replace(/\{fee\}/g, settings.deliveryFee.toFixed(2))
      .replace(/\{free\}/g, String(settings.freeDeliveryThreshold))
      .replace(/\{area\}/g, settings.deliveryArea)
      .replace(/\{address\}/g, settings.address);
  const { toast } = useToast();
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.openCart);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const name = locale === "fi" ? product.nameFi : product.nameEn;
  const desc = locale === "fi" ? product.descFi : product.descEn;
  const categoryLabel =
    t.shop.categories[product.category as keyof typeof t.shop.categories] ?? product.category;

  const oldPrice = product.oldPrice;
  const discounted = oldPrice != null && oldPrice > product.price;
  const discountPct = discounted
    ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
    : 0;
  const savings = discounted ? Math.round((oldPrice - product.price) * 100) / 100 : 0;

  const fmt = (n: number) => `${n.toFixed(2)} €`;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      nameFi: product.nameFi,
      price: product.price,
      image: product.image,
      unit: product.unit,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    toast({
      title: t.cart.addedToCart,
      description: `${qty} × ${name}`,
      action: (
        <Button size="sm" variant="outline" onClick={openCart} className="h-8">
          {t.cart.title}
        </Button>
      ),
    });
  };

  const maxQty = Math.max(1, Math.min(product.stock, 99));

  // Go back to where the visitor came from when it was within this site;
  // otherwise (direct link / search engine) land on the shop page.
  const handleBack = () => {
    const cameFromSite =
      document.referrer && document.referrer.startsWith(window.location.origin);
    if (cameFromSite) {
      router.back();
    } else {
      router.push("/shop");
    }
  };

  return (
    <div className="bg-white dark:bg-stone-950">
      {/* Back button + breadcrumbs */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t.product.back}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:bg-stone-800 dark:hover:text-emerald-300 dark:focus-visible:ring-offset-stone-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.product.back}
        </button>
        <nav aria-label="Breadcrumb" className="mt-3">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <li>
            <Link href="/" className="transition-colors hover:text-emerald-700 dark:hover:text-emerald-300">
              {t.product.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <Link href="/shop" className="transition-colors hover:text-emerald-700 dark:hover:text-emerald-300">
              {t.product.breadcrumbShop}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li aria-current="page" className="max-w-[50vw] truncate font-medium text-stone-800 dark:text-stone-200 sm:max-w-md">
            {name}
          </li>
          </ol>
        </nav>
      </div>

      {/* Product */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-stone-100 ring-1 ring-stone-200/70 dark:bg-stone-800 dark:ring-stone-800">
              <img
                src={photo}
                alt={name}
                className="h-full w-full object-cover"
              />
              {product.badge && BADGE_STYLES[product.badge] && (
                <span
                  className={cn(
                    "absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow",
                    BADGE_STYLES[product.badge]
                  )}
                >
                  {t.shop.badges[product.badge as keyof typeof t.shop.badges] ?? product.badge}
                </span>
              )}
              {discounted && (
                <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                  −{discountPct}%
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 10).map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setPhoto(url)}
                    aria-label="Show this photo"
                    className={cn(
                      "overflow-hidden rounded-xl ring-2 transition-all",
                      photo === url ? "ring-emerald-600" : "ring-transparent hover:ring-stone-300"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex flex-col"
          >
            {/* Category chip */}
            <div>
              <Link
                href={`/shop?category=${product.category}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-emerald-200"
              >
                <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                {categoryLabel}
              </Link>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
              {name}
            </h1>
            <p className="mt-1.5 text-sm text-stone-400 dark:text-stone-500">{product.unit}</p>

            {/* Price block */}
            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 sm:text-4xl">
                {fmt(product.price)}
              </span>
              {discounted && (
                <>
                  <span className="text-xl text-stone-400 line-through dark:text-stone-500">
                    {fmt(oldPrice)}
                  </span>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
                    {t.product.saveTag} {fmt(savings)}
                  </span>
                </>
              )}
            </div>

            {/* Stock + best seller */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-lime-700 dark:text-lime-400">
                  <span className="h-2 w-2 rounded-full bg-lime-500" aria-hidden="true" />
                  {t.product.inStock}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                  {t.shop.outOfStock}
                </span>
              )}
              {product.bestSeller && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                  {t.home.bestSellers.label}
                </span>
              )}
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t.product.description}
            </h2>
            <p className="mt-2 leading-relaxed text-stone-700 dark:text-stone-300">{desc}</p>

            {/* Quantity + add to cart */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-12 w-full items-center justify-between rounded-full border border-stone-200 px-2 dark:border-stone-700 sm:w-36 sm:justify-center sm:gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label={t.cart.decrease}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span className="min-w-8 text-center text-base font-semibold" aria-live="polite">
                  {qty}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label={t.cart.increase}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <Button
                size="lg"
                onClick={handleAdd}
                disabled={product.stock <= 0}
                aria-label={`${t.shop.addToCart}: ${name}`}
                className={cn(
                  "h-12 flex-1 rounded-full text-base font-semibold transition-colors",
                  added
                    ? "bg-lime-600 text-white hover:bg-lime-600"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                )}
              >
                {added ? (
                  <>
                    <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                    {t.shop.added}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
                    {t.shop.addToCart} · {fmt(product.price * qty)}
                  </>
                )}
              </Button>
            </div>

            {/* Fulfilment info */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-stone-800">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {deliveryInfo(t.product.deliveryText)}
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-stone-800">
                <Store className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {deliveryInfo(t.product.pickupText)}
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-stone-800 sm:col-span-2">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {t.product.qualityText}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-stone-50 py-16 dark:bg-stone-900/40 sm:py-20" aria-label={t.product.related}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
                {t.product.related}
              </h2>
              <Link
                href="/shop"
                className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
              >
                {t.product.viewAll}
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
