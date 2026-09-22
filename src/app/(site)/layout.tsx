import { ThemeProvider } from "@/components/site/theme-provider";
import { LanguageProvider } from "@/components/site/language-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSheet } from "@/components/site/cart-sheet";

/** Storefront chrome: header, footer, cart drawer. Admin pages opt out. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div
          suppressHydrationWarning
          className="flex min-h-screen flex-col overflow-x-hidden bg-white dark:bg-stone-950"
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSheet />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
