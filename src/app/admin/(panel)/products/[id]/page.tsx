import { notFound } from "next/navigation";
import { sbGetProductById, type Product } from "@/lib/products";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let product: Product | null = null;
  try {
    product = await sbGetProductById(id);
  } catch {
    // Supabase not reachable — render the form empty with a warning via null product
  }
  if (!product) notFound();

  const gallery: string[] = [];
  for (const url of [product.image, ...(product.images ?? [])]) {
    if (url && !gallery.includes(url)) gallery.push(url);
  }

  const initial: ProductFormValues = {
    nameEn: product.nameEn,
    nameFi: product.nameFi,
    descEn: product.descEn,
    descFi: product.descFi,
    price: String(product.price),
    oldPrice: product.oldPrice == null ? "" : String(product.oldPrice),
    unit: product.unit,
    category: product.category,
    images: gallery,
    badge: product.badge ?? "none",
    bestSeller: product.bestSeller,
    stock: String(product.stock),
  };

  return <ProductForm mode="edit" productId={product.id} initial={initial} />;
}
