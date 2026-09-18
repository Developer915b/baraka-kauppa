import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { BestSellers } from "@/components/site/best-sellers";
import { Deals } from "@/components/site/deals";
import { Categories } from "@/components/site/categories";
import { Gallery } from "@/components/site/gallery";
import { HomeCta } from "@/components/site/home-cta";
import { CATALOG } from "@/lib/catalog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | International & Halal Grocery Store in Kouvola — Order Online`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} | International & Halal Grocery Store in Kouvola`,
    description: SITE_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: "/images/hero.png", width: 1344, height: 768, alt: "Inside Baraka Kauppa — shelves full of world flavours" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | International & Halal Grocery Store in Kouvola`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero.png"],
  },
};

/** GroceryStore structured data for rich search results. */
const groceryStoreJsonLd = {
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/images/hero.png`,
  telephone: "+358 45 8652799",
  email: "hossainsohid@gmail.com",
  priceRange: "€",
  currenciesAccepted: "EUR",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kouvolankatu 34 A31",
    postalCode: "45100",
    addressLocality: "Kouvola",
    addressCountry: "FI",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "12:00",
      closes: "18:00",
    },
  ],
  sameAs: ["https://www.facebook.com/people/Baraka-Kauppa/61592352316861/"],
  hasMap: "https://www.google.com/maps/search/?api=1&query=Kouvolankatu+34+A31+45100+Kouvola",
};

export default function Home() {
  // Initial merchandising data straight from the static catalog:
  // server-rendered HTML contains real product names + prices (SEO),
  // and the sections re-sync with the API after hydration.
  const bestSellers = CATALOG.filter((p) => p.bestSeller).map((p) => ({ ...p }));
  const deals = CATALOG.filter((p) => p.oldPrice != null).map((p) => ({ ...p }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(groceryStoreJsonLd) }}
      />
      <Hero />
      <Features />
      <BestSellers products={bestSellers} />
      <Deals products={deals} />
      <Categories className="bg-white dark:bg-stone-950" />
      <Gallery />
      <HomeCta />
    </>
  );
}
