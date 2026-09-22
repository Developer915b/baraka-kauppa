"use client";

import Link from "next/link";
import { MapPin, ShoppingBasket, Phone, Mail, Globe } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";

const FB_URL = "https://www.facebook.com/people/Baraka-Kauppa/61592352316861/";

export function Footer() {
  const { t } = useLanguage();

  const links = [
    { key: "home" as const, href: "/" },
    { key: "shop" as const, href: "/shop" },
    { key: "contact" as const, href: "/contact" },
  ];

  const linkLabel = (key: string) => {
    if (key === "shop") return t.shop.label;
    return t.nav[key as keyof typeof t.nav];
  };

  return (
    <footer className="mt-auto bg-stone-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-emerald-950">
                <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="leading-none">
                <p className="text-lg font-bold text-white">Baraka Kauppa</p>
                <p className="text-[11px] font-medium uppercase tracking-widest text-amber-400">
                  Kouvola
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.footer.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className="inline-block py-0.5 text-sm text-stone-400 transition-colors hover:text-amber-300"
                  >
                    {linkLabel(l.key)}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-0.5 text-sm text-stone-400 transition-colors hover:text-amber-300"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.footer.contactTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-stone-400">
              <li>
                <a
                  href="tel:+358458652799"
                  className="flex items-start gap-2 transition-colors hover:text-amber-300"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  +358 45 8652799
                </a>
              </li>
              <li>
                <a
                  href="mailto:hossainsohid@gmail.com"
                  className="flex items-start gap-2 break-all transition-colors hover:text-amber-300"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  hossainsohid@gmail.com
                </a>
              </li>
              <li>
                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 transition-colors hover:text-amber-300"
                >
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  facebook.com/Baraka Kauppa
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.visit.addressTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                <span>
                  Kouvolankatu 34 A31
                  <br />
                  45100 Kouvola
                  <br />
                  {t.footer.madeIn}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-stone-800 pt-6 text-xs text-stone-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Baraka Kauppa Oy · Business ID 3639588-4 ·{" "}
            {t.footer.rights}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {t.footer.madeIn}
          </p>
        </div>
      </div>
    </footer>
  );
}
