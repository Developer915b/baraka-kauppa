"use client";

import { motion } from "framer-motion";
import { Facebook, Mail, Phone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";
import { useSettings } from "@/components/site/settings-provider";

export function Contact() {
  const { t, locale } = useLanguage();
  const settings = useSettings();

  const contactNote = locale === "fi" ? settings.contactNoteFi : settings.contactNoteEn;

  const channels = [
    {
      icon: Phone,
      label: t.contact.phoneLabel,
      value: settings.phone,
      href: `tel:${settings.phone.replace(/[^+\d]/g, "")}`,
      external: false,
    },
    {
      icon: Mail,
      label: t.contact.emailLabel,
      value: settings.email,
      href: `mailto:${settings.email}`,
      external: false,
    },
    {
      icon: Facebook,
      label: t.contact.facebook,
      value: "Baraka Kauppa | Kouvola",
      href: settings.facebookUrl,
      external: true,
    },
  ];

  return (
    <section id="contact" className="scroll-mt-20 bg-white py-20 dark:bg-stone-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-emerald-900 shadow-xl">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:p-16">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
            >
              <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
                {t.contact.label}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t.contact.title}
              </h2>
              <p className="mt-4 leading-relaxed text-emerald-100">
                {t.contact.subtitle}
              </p>
              {contactNote && (
                <p className="mt-3 rounded-2xl bg-emerald-800/60 px-4 py-3 text-sm leading-relaxed text-emerald-100 ring-1 ring-emerald-700/50">
                  {contactNote}
                </p>
              )}
              <Button
                asChild
                size="lg"
                className="mt-8 h-12 rounded-full bg-amber-400 px-7 text-base font-semibold text-emerald-950 hover:bg-amber-300"
              >
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                  <Facebook className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t.contact.facebook}
                </a>
              </Button>
            </motion.div>

            {/* Channels */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              {channels.map((ch) => (
                <li key={ch.label}>
                  <a
                    href={ch.href}
                    {...(ch.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex items-center gap-4 rounded-2xl bg-emerald-800/60 p-4 ring-1 ring-emerald-700/50 transition-colors hover:bg-emerald-800"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                      <ch.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wide text-emerald-300">
                        {ch.label}
                      </span>
                      <span className="block text-sm font-semibold text-white">
                        {ch.value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-4 rounded-2xl bg-emerald-800/60 p-4 ring-1 ring-emerald-700/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <Store className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-emerald-300">
                    {t.contact.storeLabel}
                  </span>
                  <span className="block text-sm font-semibold text-white">
                    {settings.address}, {settings.postalCode} {settings.city}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-emerald-200">
                    {t.contact.storeText}
                  </span>
                </span>
              </li>
            </motion.ul>
          </div>
        </div>
      </div>
    </section>
  );
}
