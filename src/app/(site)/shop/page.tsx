import type { Metadata } from "next";
import { Suspense } from "react";
import { Shop } from "@/components/site/shop";
import { Categories } from "@/components/site/categories";

export const metadata: Metadata = {
  title: "Shop Online — Halal & International Groceries",
  description:
    "Order halal and international groceries online — basmati rice, curry pastes, dates, halal meat, spices and more. Pay on delivery or pick up in store in Kouvola.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop Online | Baraka Kauppa",
    description:
      "Order halal and international groceries online — home delivery in Kouvola or free store pickup.",
    type: "website",
  },
};

function ShopFallback() {
  return (
    <section className="bg-stone-50 pt-32 pb-20 dark:bg-stone-900/40 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-64 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
      </div>
    </section>
  );
}

export default function ShopPage() {
  return (
    <>
      <Suspense fallback={<ShopFallback />}>
        <Shop />
      </Suspense>
      <Categories />
    </>
  );
}
