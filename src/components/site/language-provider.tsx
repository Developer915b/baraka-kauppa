"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { translations, type Locale, type Translations } from "@/lib/i18n";

type LanguageContextType = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "baraka-locale";
const LOCALE_EVENT = "baraka-locale-change";

function subscribe(callback: () => void) {
  window.addEventListener(LOCALE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LOCALE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "fi" ? "fi" : "en";
  } catch {
    return "en";
  }
}

function getServerSnapshot(): Locale {
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable
    }
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(getSnapshot() === "en" ? "fi" : "en");
  }, [setLocale]);

  // Keep <html lang> attribute in sync (external system update)
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
