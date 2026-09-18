import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/theme-provider";
import { LanguageProvider } from "@/components/site/language-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSheet } from "@/components/site/cart-sheet";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | International & Halal Grocery Store in Kouvola`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Baraka Kauppa",
    "Kouvola",
    "halal",
    "halal Kouvola",
    "international grocery",
    "Asian food Kouvola",
    "African food",
    "Middle Eastern food",
    "ruokakauppa Kouvola",
    "elintarvikeliike",
    "verkkokauppa",
    "halal liha",
  ],
  authors: [{ name: "Baraka Kauppa Oy" }],
  creator: "Baraka Kauppa Oy",
  publisher: "Baraka Kauppa Oy",
  formatDetection: {
    telephone: true,
    email: true,
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      fi: "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: `${SITE_NAME} | International & Halal Grocery Store`,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    alternateLocale: "fi_FI",
    images: [
      {
        url: "/images/hero.png",
        width: 1344,
        height: 768,
        alt: "Inside Baraka Kauppa — shelves full of world flavours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | International & Halal Grocery Store`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero.png"],
  },
  category: "grocery",
};

export const viewport: Viewport = {
  themeColor: "#065f46",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
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
        <Toaster />
      </body>
    </html>
  );
}
