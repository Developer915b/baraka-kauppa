"use client";

import { Facebook, MapPin, ShoppingBasket } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";

const FB_URL = "https://www.facebook.com/people/Baraka-Kauppa/61592352316861/";

export function Footer() {
  const { t } = useLanguage();

  const links = [
    { key: "about" as const, href: "#about" },
    { key: "products" as const, href: "#products" },
    { key: "gallery" as const, href: "#gallery" },
    { key: "visit" as const, href: "#visit" },
    { key: "contact" as const, href: "#contact" },
  ];

  return (
    <footer className="mt-auto bg-stone-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
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
            <a
              href={FB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Baraka Kauppa on Facebook"
              className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-300 transition-colors hover:bg-amber-400 hover:text-emerald-950"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.footer.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    className="text-sm text-stone-400 transition-colors hover:text-amber-300"
                  >
                    {t.nav[l.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.footer.contactTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                <span>
                  Mertakuja 4 A 3, 45160 Kouvola
                  <br />
                  {t.footer.madeIn}
                </span>
              </li>
              <li>
                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-amber-300"
                >
                  facebook.com/Baraka Kauppa
                </a>
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
