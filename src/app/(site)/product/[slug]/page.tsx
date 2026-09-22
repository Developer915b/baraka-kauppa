import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, listProducts } from "@/lib/products";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { ProductDetail, type ProductDetailData } from "@/components/site/product-detail";

type PageProps = { params: Promise<{ slug: string }> };

/** Supabase first (source of truth), static catalog fallback (serverless). */
async function getProductBySlugSafe(slug: string): Promise<ProductDetailData | null> {
  try {
    return await getProductBySlug(slug);
  } catch (error) {
    console.error("Product lookup failed, using static catalog fallback:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugSafe(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  const title = `${product.nameEn} — ${product.price.toFixed(2)} €`;
  return {
    title,
    description: product.descEn,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.nameEn} | ${SITE_NAME}`,
      description: product.descEn,
      type: "website",
      url: `${SITE_URL}/product/${product.slug}`,
      images: [{ url: product.image, alt: product.nameEn }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.nameEn} | ${SITE_NAME}`,
      description: product.descEn,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlugSafe(slug);
  if (!product) notFound();

  // Related: same category first, then other products to fill up to 4.
  const { products: all } = await listProducts();
  const sameCategory = all.filter((p) => p.id !== product.id && p.category === product.category);
  const others = all.filter((p) => p.id !== product.id && p.category !== product.category);
  const related = [...sameCategory, ...others].slice(0, 4).map((p) => ({ ...p }));

  const productUrl = `${SITE_URL}/product/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    description: product.descEn,
    image: `${SITE_URL}${product.image}`,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.nameEn, item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
