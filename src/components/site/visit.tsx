"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Facebook, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Kouvolankatu+34+A31+45100+Kouvola+Finland";
const FB_URL = "https://www.facebook.com/people/Baraka-Kauppa/61592352316861/";

export function Visit() {
  const { t } = useLanguage();

  return (
    <section id="visit" className="scroll-mt-20 bg-stone-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            {t.visit.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {t.visit.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            {t.visit.subtitle}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Address + map card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/70"
          >
            {/* Stylised map area */}
            <div className="relative flex h-56 items-center justify-center bg-emerald-800">
              {/* decorative map lines */}
              <svg
                className="absolute inset-0 h-full w-full opacity-20"
                aria-hidden="true"
                viewBox="0 0 400 224"
                preserveAspectRatio="none"
              >
                <path d="M0 60 L400 90" stroke="white" strokeWidth="6" fill="none" />
                <path d="M0 150 L400 130" stroke="white" strokeWidth="4" fill="none" />
                <path d="M120 0 L150 224" stroke="white" strokeWidth="5" fill="none" />
                <path d="M290 0 L260 224" stroke="white" strokeWidth="3" fill="none" />
              </svg>
              <div className="relative flex flex-col items-center text-white">
                <span className="flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-amber-400 shadow-lg">
                  <MapPin className="h-7 w-7 text-emerald-950" aria-hidden="true" />
                </span>
                <p className="mt-3 text-lg font-semibold drop-shadow">
                  Baraka Kauppa
                </p>
                <p className="text-sm text-emerald-100">Kouvola · Finland</p>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <MapPin className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                {t.visit.addressTitle}
              </h3>
              <p className="mt-3 text-base font-medium text-stone-800">
                {t.visit.address}
              </p>
              <p className="text-base text-stone-600">{t.visit.city}</p>
              <Button
                asChild
                className="mt-5 rounded-full bg-emerald-700 hover:bg-emerald-800"
              >
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t.visit.directions}
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Hours + FB card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/70"
          >
            <div className="p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <Clock className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                {t.visit.hoursTitle}
              </h3>
              <ul className="mt-4 divide-y divide-stone-100">
                {t.visit.hours.map((row) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between py-3 text-base"
                  >
                    <span className="text-stone-700">{row.day}</span>
                    <span className="font-semibold text-stone-900">{row.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-stone-500">{t.visit.hoursNote}</p>
            </div>
            <div className="mt-auto border-t border-stone-100 bg-amber-50/60 p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <Facebook className="h-5 w-5 text-stone-700" aria-hidden="true" />
                {t.visit.fbButton}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {t.visit.fbDescription}
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 rounded-full border-emerald-700/40 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <a href={FB_URL} target="_blank" rel="noopener noreferrer">
                  {t.visit.fbButton}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
