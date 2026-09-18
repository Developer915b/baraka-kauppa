"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingBasket, Globe, X, Facebook, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";
import { useCart, cartCount } from "@/store/cart";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "about", href: "#about" },
  { key: "products", href: "#products" },
  { key: "shop", href: "#shop" },
  { key: "gallery", href: "#gallery" },
  { key: "visit", href: "#visit" },
  { key: "contact", href: "#contact" },
] as const;

export function Header() {
  const { t, locale, toggleLocale } = useLanguage();
  const { items, openCart } = useCart();
  const count = cartCount(items);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 shadow-md backdrop-blur-md"
          : "bg-gradient-to-b from-black/50 to-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#home"
          onClick={closeMenu}
          className="flex items-center gap-2.5"
          aria-label="Baraka Kauppa home"
        >
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              scrolled ? "bg-emerald-700 text-white" : "bg-amber-400 text-emerald-950"
            )}
          >
            <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "text-lg font-bold tracking-tight transition-colors",
                scrolled ? "text-emerald-900" : "text-white"
              )}
            >
              Baraka Kauppa
            </span>
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-widest transition-colors",
                scrolled ? "text-amber-600" : "text-amber-300"
              )}
            >
              Kouvola
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-stone-700 hover:bg-emerald-50 hover:text-emerald-800"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart button */}
          <Button
            size="sm"
            onClick={openCart}
            aria-label={`${t.cart.title} (${count})`}
            className={cn(
              "relative h-10 gap-1.5 rounded-full px-3 text-sm font-semibold",
              scrolled
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-amber-400 text-emerald-950 hover:bg-amber-300"
            )}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t.cart.title}</span>
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white ring-2 ring-white"
              >
                {count}
              </span>
            )}
          </Button>

          {/* Facebook link */}
          <a
            href="https://www.facebook.com/people/Baraka-Kauppa/61592352316861/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Baraka Kauppa on Facebook"
            className={cn(
              "hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:flex",
              scrolled
                ? "text-stone-600 hover:bg-emerald-50 hover:text-emerald-700"
                : "text-white/90 hover:bg-white/10 hover:text-white"
            )}
          >
            <Facebook className="h-5 w-5" aria-hidden="true" />
          </a>

          {/* Language switch */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            aria-label={t.langSwitchLabel}
            className={cn(
              "h-10 gap-1.5 rounded-full px-3 text-sm font-semibold",
              scrolled
                ? "border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                : "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            )}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            {locale === "en" ? "EN" : "FI"}
          </Button>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden",
              scrolled
                ? "text-stone-700 hover:bg-emerald-50"
                : "text-white hover:bg-white/10"
            )}
          >
            {menuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-stone-100 bg-white md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1 px-4 py-4">
              {[{ key: "home" as const, href: "#home" }, ...NAV_ITEMS].map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {t.nav[item.key]}
                </a>
              ))}
              <a
                href="https://www.facebook.com/people/Baraka-Kauppa/61592352316861/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
                Facebook
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
