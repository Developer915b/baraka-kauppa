"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Globe2, Leaf, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";

const ICONS = [BadgeCheck, Globe2, Leaf, HeartHandshake] as const;

export function Features() {
  const { t } = useLanguage();
  const items = [t.features.halal, t.features.world, t.features.fresh, t.features.local];

  return (
    <section className="relative z-10 bg-stone-50 py-14 dark:bg-stone-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group flex items-start gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-700/10 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white dark:bg-emerald-400/10 dark:text-emerald-300 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
