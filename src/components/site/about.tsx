"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img
                src="/images/about-store.png"
                alt="Inside Baraka Kauppa — shelves with international foods"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 rounded-2xl bg-emerald-700 px-6 py-4 text-white shadow-lg sm:right-6">
              <p className="text-2xl font-bold">2026</p>
              <p className="text-sm text-emerald-100">Kouvola&apos;s newest market</p>
            </div>
            <div className="absolute -left-3 -top-3 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl" />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              {t.about.label}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {t.about.title}
            </h2>
            <div className="mt-6 space-y-4">
              {t.about.paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed text-stone-600">
                  {p}
                </p>
              ))}
            </div>

            {/* Community quote */}
            <figure className="mt-8 rounded-2xl border-l-4 border-amber-400 bg-stone-50 p-5">
              <Quote className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <blockquote className="mt-2 text-base italic leading-relaxed text-stone-700">
                {t.about.quote}
              </blockquote>
              <figcaption className="mt-2 text-sm text-stone-500">
                {t.about.quoteSource}
              </figcaption>
            </figure>

            {/* Facts */}
            <dl className="mt-8 grid grid-cols-2 gap-4">
              {t.about.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200/70"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-stone-900">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
