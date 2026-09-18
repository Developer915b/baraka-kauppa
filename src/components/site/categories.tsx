"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/site/language-provider";

const CATEGORY_IMAGES = [
  { src: "/images/cat-asian.png", alt: "Asian pantry products — rice, noodles and sauces" },
  { src: "/images/cat-chinese.png", alt: "Chinese cooking ingredients" },
  { src: "/images/cat-thai.png", alt: "Thai curry pastes and fresh ingredients" },
  { src: "/images/cat-arabic.png", alt: "Arabic and Middle Eastern foods — dates, olive oil, spices" },
  { src: "/images/cat-african.png", alt: "African foods — plantains, flours and grains" },
  { src: "/images/cat-halal.png", alt: "Fresh certified halal meat counter" },
] as const;

export function Categories() {
  const { t } = useLanguage();

  return (
    <section id="products" className="scroll-mt-20 bg-stone-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            {t.categories.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {t.categories.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
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
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70 transition-all hover:-translate-y-1 hover:shadow-xl"
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
                <h3 className="text-lg font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
