"use client";

// Site settings on the storefront: fetched on the server (cached there) and
// handed to client components through context. Falls back to the built-in
// defaults, so every consumer works even before the settings table exists.

import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";

const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

/** Current shop settings (address, contacts, delivery fee, hours…). */
export function useSettings(): SiteSettings {
  return useContext(SettingsContext);
}

/** "4.90 €" — dot decimals everywhere, matching the site price style. */
export function euro(n: number): string {
  return `${n.toFixed(2)} €`;
}
