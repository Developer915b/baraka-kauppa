"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { cn } from "@/lib/utils";

const CATEGORY_IMAGES = [
  { src: "/images/cat-asian.png", alt: "Asian pantry products — rice, noodles and sauces", key: "asian" },
  { src: "/images/cat-chinese.png", alt: "Chinese cooking ingredients", key: "chinese" },
  { src: "/images/cat-thai.png", alt: "Thai curry pastes and fresh ingredients", key: "thai" },
  { src: "/images/cat-arabic.png", alt: "Arabic and Middle Eastern foods — dates, olive oil, spices", key: "arabic" },
  { src: "/images/cat-african.png", alt: "African foods — plantains, flours and grains", key: "african" },
  { src: "/images/cat-halal.png", alt: "Fresh certified halal meat counter", key: "halal" },
] as const;

type CategoriesProps = {
  /** Optional background override, e.g. on the homepage between other sections. */
  className?: string;
};

export function Categories({ className }: CategoriesProps) {
  const { t } = useLanguage();

  return (
    <section
      id="products"
      className={cn("scroll-mt-20 py-20 sm:py-24", className ?? "bg-stone-50 dark:bg-stone-900/40")}
    >
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
            {t.categories.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            {t.categories.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            {t.categories.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.categories.items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-stone-900 dark:ring-stone-800"
            >
              <Link
                href={`/shop?category=${CATEGORY_IMAGES[i].key}`}
                className="block"
                aria-label={`${item.title} — ${t.categories.browse}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={CATEGORY_IMAGES[i].src}
                    alt={CATEGORY_IMAGES[i].alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition-colors group-hover:text-emerald-800 dark:text-emerald-300 dark:group-hover:text-amber-200">
                    {t.categories.browse}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
