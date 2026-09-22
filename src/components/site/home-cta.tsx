"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";

export function HomeCta() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-16 dark:bg-stone-950 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-emerald-900 px-6 py-12 text-center shadow-xl sm:px-12"
        >
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.homeCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-emerald-100 sm:text-lg">
            {t.homeCta.text}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full bg-amber-400 px-7 text-base font-semibold text-emerald-950 hover:bg-amber-300 sm:w-auto"
            >
              <Link href="/shop">
                {t.homeCta.shop}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white/20 hover:text-white sm:w-auto"
            >
              <Link href="/contact">
                <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                {t.homeCta.contact}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
