import { ThemeProvider } from "@/components/site/theme-provider";
import { LanguageProvider } from "@/components/site/language-provider";
import { SettingsProvider } from "@/components/site/settings-provider";
import { AuthProvider } from "@/components/site/auth-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSheet } from "@/components/site/cart-sheet";
import { getSettings } from "@/lib/settings";

/** Storefront chrome: header, footer, cart drawer. Admin pages opt out. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Owner-editable shop data, read from cache (no repeated DB hits).
  const settings = await getSettings();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider settings={settings}>
          <AuthProvider>
            <div
              suppressHydrationWarning
              className="flex min-h-screen flex-col overflow-x-hidden bg-white dark:bg-stone-950"
            >
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartSheet />
            </div>
          </AuthProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
