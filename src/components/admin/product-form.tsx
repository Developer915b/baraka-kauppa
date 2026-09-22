"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type ProductFormValues = {
  nameEn: string;
  nameFi: string;
  descEn: string;
  descFi: string;
  price: string;
  oldPrice: string;
  unit: string;
  category: string;
  /** Photo gallery — the first photo is the cover shown in the shop. */
  images: string[];
  badge: string;
  bestSeller: boolean;
  stock: string;
};

export const EMPTY_PRODUCT: ProductFormValues = {
  nameEn: "",
  nameFi: "",
  descEn: "",
  descFi: "",
  price: "",
  oldPrice: "",
  unit: "",
  category: "asian",
  images: [],
  badge: "none",
  bestSeller: false,
  stock: "25",
};

const CATEGORIES = [
  { key: "asian", label: "Asian Pantry (rice, noodles, sauces…)" },
  { key: "chinese", label: "Chinese Kitchen" },
  { key: "thai", label: "Thai Essentials (curry pastes…)" },
  { key: "arabic", label: "Arabic & Middle East (dates, oil…)" },
  { key: "african", label: "African Flavours (plantain, cassava…)" },
  { key: "halal", label: "Halal Meat" },
  { key: "spices", label: "Spices & Pantry" },
];

const IMAGE_SUGGESTIONS = [
  "/images/prod-rice.png",
  "/images/prod-ramen.png",
  "/images/prod-coconut.png",
  "/images/prod-tea.png",
  "/images/prod-curry.png",
  "/images/prod-green-curry.png",
  "/images/prod-dates.png",
  "/images/prod-oil.png",
  "/images/prod-tahini.png",
  "/images/prod-plantain.png",
  "/images/prod-cassava.png",
  "/images/prod-flour.png",
  "/images/prod-wings.png",
  "/images/prod-chicken.png",
  "/images/prod-turmeric.png",
  "/images/prod-cumin.png",
  "/images/prod-coriander.png",
  "/images/prod-bariis.png",
];

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: number;
  initial?: ProductFormValues;
};

export function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [values, setValues] = useState<ProductFormValues>(initial ?? EMPTY_PRODUCT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0); // number of photos still uploading
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const price = Number(values.price.replace(",", "."));
  const oldPrice = values.oldPrice.trim() === "" ? null : Number(values.oldPrice.replace(",", "."));
  const discounted = oldPrice != null && Number.isFinite(oldPrice) && Number.isFinite(price) && oldPrice > price;
  const pct = discounted ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const cover = values.images[0] ?? null;

  // ---------- Photo handling ----------
  // Photos are uploaded ONE PER REQUEST, in sequence. Multi-select still works
  // (the queue runs automatically), but each request stays far below the
  // hosting provider's ~4.5 MB request limit — sending several photos in one
  // request made multi-upload fail on the live site (413 payload too large),
  // while single photos worked.
  const MAX_REQUEST_BYTES = 3_500_000;

  // Shrink a photo in the browser when it is too big to upload safely:
  // resize to max 2200 px and re-encode as high-quality JPEG (the server
  // re-optimises to WebP afterwards, so quality stays sharp).
  const compressImage = async (file: File): Promise<File | null> => {
    try {
      if (file.type === "image/gif") return null;
      const bitmap = await createImageBitmap(file);
      const maxDim = 2200;
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close();
        return null;
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );
      if (!blob || blob.size >= file.size) return null;
      const name = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
      return new File([blob], name, { type: "image/jpeg" });
    } catch {
      // Browser cannot decode this format (e.g. HEIC outside Safari) — the
      // caller falls back to the original file.
      return null;
    }
  };

  const addImages = (urls: string[]) =>
    setValues((v) => {
      const merged = [...v.images];
      for (const url of urls) {
        if (!merged.includes(url) && merged.length < 8) merged.push(url);
      }
      return { ...v, images: merged };
    });

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setUploadError("Please choose photo files (JPG, PNG, WebP or HEIC).");
      return;
    }
    setUploadError(null);
    setUploading((n) => n + list.length);
    const tooBig: string[] = [];
    for (const original of list) {
      try {
        // Big photos are compressed in the browser first; small ones go as-is.
        let file = original;
        if (file.size > MAX_REQUEST_BYTES) {
          const smaller = await compressImage(file);
          if (smaller) file = smaller;
        }
        if (file.size > MAX_REQUEST_BYTES) {
          tooBig.push(original.name);
          continue;
        }
        const form = new FormData();
        form.append("files", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const body = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(body.urls) && body.urls.length > 0) {
          addImages(body.urls as string[]);
        } else {
          setUploadError(body.error ?? "Uploading failed. Please try again.");
        }
      } catch {
        setUploadError("Uploading failed. Check your connection and try again.");
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
    if (tooBig.length > 0) {
      setUploadError(
        `${tooBig.join(", ")} ${tooBig.length > 1 ? "are" : "is"} too large to upload. Please choose a smaller photo.`
      );
    }
  };

  const makeCover = (url: string) =>
    setValues((v) => ({ ...v, images: [url, ...v.images.filter((u) => u !== url)] }));

  const removeImage = (url: string) =>
    setValues((v) => ({ ...v, images: v.images.filter((u) => u !== url) }));

  // ---------- Save ----------
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (values.nameEn.trim().length < 2) return setError("Please enter the product name (English).");
    if (!Number.isFinite(price) || price < 0) return setError("Please enter a valid price (e.g. 6.90).");
    if (values.oldPrice.trim() !== "" && (oldPrice === null || !Number.isFinite(oldPrice) || oldPrice <= price)) {
      return setError("The old price must be a number higher than the current price — that's what creates the discount badge.");
    }

    setBusy(true);
    try {
      const payload = {
        nameEn: values.nameEn.trim(),
        nameFi: values.nameFi.trim(),
        descEn: values.descEn.trim(),
        descFi: values.descFi.trim(),
        price,
        oldPrice: values.oldPrice.trim() === "" ? null : oldPrice,
        unit: values.unit.trim(),
        category: values.category,
        image: cover ?? "/images/prod-rice.png",
        images: values.images,
        badge: values.badge === "none" ? null : values.badge,
        bestSeller: values.bestSeller,
        stock: Math.max(0, Math.round(Number(values.stock) || 0)),
        slug: values.nameEn, // slugified server-side
      };

      const res = await fetch(mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({
          title: mode === "create" ? "Product added" : "Changes saved",
          description: `${payload.nameEn} is live in the store.`,
        });
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(body.error ?? "Saving failed. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const field = "h-11 rounded-xl";
  const labelCls = "text-sm font-semibold text-stone-700";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl">
            <Link href="/admin/products" aria-label="Back to products">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              {mode === "create" ? "New product" : "Edit product"}
            </h1>
            <p className="text-sm text-stone-500">Changes go live in the store as soon as you save.</p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="h-11 rounded-xl bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-800"
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2 h-4 w-4" aria-hidden="true" />}
          {busy ? "Saving…" : mode === "create" ? "Add product" : "Save changes"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: names + description */}
        <div className="space-y-5 lg:col-span-2">
          <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-bold text-stone-900">Names</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nameEn" className={labelCls}>
                  Name in English <span className="text-red-500">*</span>
                </Label>
                <Input id="nameEn" value={values.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="Premium Basmati Rice 5 kg" className={field} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nameFi" className={labelCls}>
                  Name in Finnish
                </Label>
                <Input id="nameFi" value={values.nameFi} onChange={(e) => set("nameFi", e.target.value)} placeholder="Premium basmatiriisi 5 kg" className={field} />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-bold text-stone-900">Description</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="descEn" className={labelCls}>In English</Label>
                <Textarea id="descEn" value={values.descEn} onChange={(e) => set("descEn", e.target.value)} placeholder="Short, appetising description…" className="min-h-24 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descFi" className={labelCls}>In Finnish</Label>
                <Textarea id="descFi" value={values.descFi} onChange={(e) => set("descFi", e.target.value)} placeholder="Lyhyt kuvaus suomeksi…" className="min-h-24 rounded-xl" />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-bold text-stone-900">Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price" className={labelCls}>
                  Current price (€) <span className="text-red-500">*</span>
                </Label>
                <Input id="price" type="number" step="0.01" min="0" inputMode="decimal" value={values.price} onChange={(e) => set("price", e.target.value)} placeholder="6.90" className={field} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oldPrice" className={labelCls}>Old price (€) — optional</Label>
                <Input id="oldPrice" type="number" step="0.01" min="0" inputMode="decimal" value={values.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} placeholder="9.90" className={field} />
                <p className="text-xs text-stone-500">Higher than the current price? The store shows a red discount badge automatically.</p>
              </div>
            </div>
            <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm ring-1 ring-stone-200" aria-live="polite">
              {Number.isFinite(price) && price > 0 ? (
                discounted ? (
                  <p className="text-stone-700">
                    Customer sees: <span className="text-lg font-bold text-emerald-800">{price.toFixed(2)} €</span>{" "}
                    <span className="text-stone-400 line-through">{oldPrice?.toFixed(2)} €</span>{" "}
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">−{pct}%</span>
                  </p>
                ) : (
                  <p className="text-stone-700">
                    Customer sees: <span className="text-lg font-bold text-emerald-800">{price.toFixed(2)} €</span>
                  </p>
                )
              ) : (
                <p className="text-stone-400">Type a price to see the live preview.</p>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-bold text-stone-900">Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="unit" className={labelCls}>Package / unit</Label>
                <Input id="unit" value={values.unit} onChange={(e) => set("unit", e.target.value)} placeholder="5 kg bag, 400 ml can…" className={field} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className={labelCls}>Category</Label>
                <select
                  id="category"
                  value={values.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={cn(field, "w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600")}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="badge" className={labelCls}>Highlight badge</Label>
                <select
                  id="badge"
                  value={values.badge}
                  onChange={(e) => set("badge", e.target.value)}
                  className={cn(field, "w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600")}
                >
                  <option value="none">No badge</option>
                  <option value="popular">Popular</option>
                  <option value="new">New</option>
                  <option value="fresh">Fresh</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock" className={labelCls}>Stock (pieces)</Label>
                <Input id="stock" type="number" min="0" max="9999" value={values.stock} onChange={(e) => set("stock", e.target.value)} className={field} />
                <p className="text-xs text-stone-500">At 0 the product shows as “Out of stock”.</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <div>
                <p className="text-sm font-semibold text-stone-800">Show in Best Sellers</p>
                <p className="text-xs text-stone-500">Featured in the “Best Sellers” row on the homepage.</p>
              </div>
              <Switch checked={values.bestSeller} onCheckedChange={(v) => set("bestSeller", v)} aria-label="Show in best sellers" />
            </div>
          </section>
        </div>

        {/* Right: photos */}
        <div className="space-y-5">
          <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-bold text-stone-900">Photos</h2>
            <p className="text-xs text-stone-500">
              The first photo is the cover. Every photo is automatically resized and compressed for
              the web — quality stays sharp.
            </p>

            {/* Upload dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                dragOver ? "border-emerald-600 bg-emerald-50" : "border-stone-300 bg-stone-50"
              )}
            >
              <UploadCloud className="h-8 w-8 text-emerald-700" aria-hidden="true" />
              <p className="text-sm font-semibold text-stone-700">
                {uploading > 0 ? `Optimising ${uploading} photo${uploading > 1 ? "s" : ""}…` : "Drag photos here"}
              </p>
              <p className="text-xs text-stone-500">or</p>
              <Button
                type="button"
                variant="outline"
                disabled={uploading > 0}
                onClick={() => fileInput.current?.click()}
                className="h-10 rounded-xl border-emerald-700 font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                {uploading > 0 ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Choose photos
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) uploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <p className="text-[11px] text-stone-400">JPG, PNG, WebP or HEIC — big photos are shrunk automatically</p>
            </div>
            {uploadError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {uploadError}
              </p>
            )}

            {/* Gallery */}
            {values.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {values.images.map((url, idx) => (
                  <div key={url} className="group relative overflow-hidden rounded-xl ring-1 ring-stone-200">
                    <div className="relative aspect-square bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Product photo ${idx + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    {idx === 0 ? (
                      <span className="absolute left-1 top-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeCover(url)}
                        className="absolute left-1 top-1 rounded-full bg-white/90 p-1 text-stone-600 shadow-sm hover:text-emerald-700"
                        aria-label="Make this the cover photo"
                      >
                        <Star className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-stone-600 shadow-sm hover:text-red-600"
                      aria-label="Remove this photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <details className="text-xs text-stone-500">
              <summary className="cursor-pointer font-semibold text-stone-600">
                Add a photo by link or use a built-in store photo
              </summary>
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/photo.jpg"
                    className="h-10 rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        if (input.value.trim()) {
                          addImages([input.value.trim()]);
                          input.value = "";
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-[11px]">Paste the link and press Enter.</p>
                <div className="grid grid-cols-4 gap-2">
                  {IMAGE_SUGGESTIONS.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => addImages([src])}
                      className="overflow-hidden rounded-lg ring-2 ring-transparent transition-all hover:ring-stone-300"
                      aria-label={`Use image ${src}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </details>
          </section>
        </div>
      </div>
    </form>
  );
}
