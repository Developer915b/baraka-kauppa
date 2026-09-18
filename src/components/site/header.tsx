"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu,
  ShoppingBasket,
  Globe,
  X,
  Facebook,
  ShoppingCart,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";
import { useCart, cartCount } from "@/store/cart";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "shop", href: "/shop" },
  { key: "contact", href: "/contact" },
] as const;

const emptySubscribe = () => () => {};

/** False during SSR/hydration, true on the client after mount — no effects needed. */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function ThemeToggle({ solid }: { solid: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t.theme.toggle}
      title={t.theme.toggle}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        solid
          ? "text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-amber-300"
          : "text-white/90 hover:bg-white/10 hover:text-white"
      )}
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

export function Header() {
  const { t, locale, setLocale } = useLanguage();
  const mounted = useMounted();
  const { items, openCart } = useCart();
  // Persisted cart rehydrates from localStorage before React hydrates —
  // start at 0 for the first (server-matching) paint, then show the real count.
  const count = mounted ? cartCount(items) : 0;
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled;
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "border-b border-stone-100 bg-white/95 shadow-md backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95"
          : "bg-gradient-to-b from-black/50 to-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-1 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Baraka Kauppa home"
        >
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              solid ? "bg-emerald-700 text-white" : "bg-amber-400 text-emerald-950"
            )}
          >
            <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "text-base font-bold tracking-tight transition-colors min-[400px]:text-lg",
                solid ? "text-emerald-900 dark:text-amber-50" : "text-white"
              )}
            >
              Baraka Kauppa
            </span>
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-widest transition-colors",
                solid ? "text-amber-600 dark:text-amber-400" : "text-amber-300"
              )}
            >
              Kouvola
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  solid
                    ? active
                      ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/40 dark:text-amber-200"
                      : "text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-amber-100"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
              >
                {t.nav[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cart button */}
          <Button
            size="sm"
            onClick={openCart}
            aria-label={`${t.cart.title} (${count})`}
            className={cn(
              "relative h-10 gap-1.5 rounded-full px-3 text-sm font-semibold",
              solid
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-amber-400 text-emerald-950 hover:bg-amber-300"
            )}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t.cart.title}</span>
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white ring-2 ring-white dark:ring-stone-950"
              >
                {count}
              </span>
            )}
          </Button>

          {/* Theme toggle */}
          <ThemeToggle solid={solid} />

          {/* Facebook link */}
          <a
            href="https://www.facebook.com/people/Baraka-Kauppa/61592352316861/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Baraka Kauppa on Facebook"
            className={cn(
              "hidden h-10 w-10 items-center justify-center rounded-full transition-colors lg:flex",
              solid
                ? "text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-stone-300 dark:hover:bg-stone-800"
                : "text-white/90 hover:bg-white/10 hover:text-white"
            )}
          >
            <Facebook className="h-5 w-5" aria-hidden="true" />
          </a>

          {/* Language switch (desktop) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === "en" ? "fi" : "en")}
            aria-label={t.langSwitchLabel}
            className={cn(
              "hidden h-10 gap-1.5 rounded-full px-3 text-sm font-semibold md:inline-flex",
              solid
                ? "border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 dark:border-stone-700 dark:text-emerald-300 dark:hover:bg-stone-800"
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
              solid
                ? "text-stone-700 hover:bg-emerald-50 dark:text-stone-200 dark:hover:bg-stone-800"
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
            className="overflow-hidden border-t border-stone-100 bg-white dark:border-stone-800 dark:bg-stone-950 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                      active
                        ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/40 dark:text-amber-200"
                        : "text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-amber-100"
                    )}
                  >
                    {t.nav[item.key]}
                  </Link>
                );
              })}

              {/* Language + theme controls for small screens */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 p-3 dark:bg-stone-900">
                <span className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-300">
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  {locale === "en" ? "English" : "Suomi"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocale(locale === "en" ? "fi" : "en")}
                  className="h-9 rounded-full border-stone-300 px-3 text-xs font-semibold text-stone-700 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  {locale === "en" ? "FI" : "EN"}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 p-3 dark:bg-stone-900">
                <span className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-300">
                  <Sun className="h-4 w-4" aria-hidden="true" />
                  {t.theme.light} / {t.theme.dark}
                </span>
                <MobileThemeToggle />
              </div>

              <a
                href="https://www.facebook.com/people/Baraka-Kauppa/61592352316861/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-medium text-stone-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-stone-300 dark:hover:bg-stone-800"
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

function MobileThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full transition-colors",
        isDark ? "bg-emerald-700" : "bg-stone-300"
      )}
    >
      <span
        className={cn(
          "absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-all",
          isDark ? "left-7" : "left-1"
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-emerald-800" aria-hidden="true" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
