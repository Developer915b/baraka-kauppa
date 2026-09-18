/**
 * Canonical site URL used for SEO metadata (metadataBase, canonical URLs,
 * JSON-LD structured data, sitemap). Set NEXT_PUBLIC_SITE_URL in the hosting
 * environment to the real production domain; the fallback covers local dev.
 */
export const SITE_URL: string =
  (process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://baraka-kauppa.netlify.app");

export const SITE_NAME = "Baraka Kauppa";

export const SITE_DESCRIPTION =
  "Baraka Kauppa is Kouvola's international and halal grocery store — Asian, Chinese, Thai, Arabic and African groceries with certified halal meats. Order online for home delivery in Kouvola or pick up in store. Open 7 days a week.";
