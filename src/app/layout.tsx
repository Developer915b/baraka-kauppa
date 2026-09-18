import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baraka Kauppa | International & Halal Grocery Store in Kouvola",
  description:
    "Baraka Kauppa is Kouvola's new international mini market — Asian, Chinese, Thai, Arabic and African groceries plus certified halal foods. Open 7 days a week.",
  keywords: [
    "Baraka Kauppa",
    "Kouvola",
    "halal",
    "international grocery",
    "Asian food",
    "African food",
    "Middle Eastern food",
    "elintarvikeliike",
  ],
  authors: [{ name: "Baraka Kauppa Oy" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Baraka Kauppa | International & Halal Grocery Store",
    description:
      "Taste the world in Kouvola — Asian, Chinese, Thai, Arabic and African groceries with certified halal selection.",
    type: "website",
    locale: "en_US",
    alternateLocale: "fi_FI",
  },
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
