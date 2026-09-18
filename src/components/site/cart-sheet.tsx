"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
  Truck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Store,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { useCart, cartCount, cartSubtotal } from "@/store/cart";
import { useLanguage } from "@/components/site/language-provider";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 4.9;
const FREE_THRESHOLD = 40;

type Step = "cart" | "checkout" | "success";

export function CartSheet() {
  const { t, locale } = useLanguage();
  const { items, isOpen, closeCart, setQty, removeItem, clear } = useCart();

  const [step, setStep] = useState<Step>("cart");
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "Kouvola",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderNo: string; total: number } | null>(null);

  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const fee =
    method === "delivery" && subtotal < FREE_THRESHOLD && subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const resetAll = () => {
    setStep("cart");
    setForm({
      customerName: "",
      phone: "",
      email: "",
      address: "",
      postalCode: "",
      city: "Kouvola",
      notes: "",
    });
    setMethod("delivery");
    setErrorMsg(null);
    setSuccess(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    // closing drawer
    if (step === "success") resetAll();
    closeCart();
  };

  const submit = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          method,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || t.checkout.error);
        return;
      }
      setSuccess({ orderNo: data.orderNo, total: data.total });
      setStep("success");

      // On Netlify, also deliver the order to the shop owner via Netlify Forms
      // (dashboard + email notifications). Fire-and-forget: the customer's
      // confirmation must not depend on it.
      if (process.env.NEXT_PUBLIC_NETLIFY === "true") {
        try {
          const payload = new URLSearchParams();
          payload.append("form-name", "orders");
          payload.append("orderNo", String(data.orderNo));
          payload.append("customerName", form.customerName.trim());
          payload.append("phone", form.phone.trim());
          payload.append("email", form.email.trim());
          payload.append("method", method);
          payload.append("address", method === "delivery" ? form.address.trim() : "");
          payload.append("city", method === "delivery" ? form.city.trim() : "");
          payload.append("postalCode", method === "delivery" ? form.postalCode.trim() : "");
          payload.append("notes", form.notes.trim());
          payload.append(
            "items",
            items
              .map((i) => `${i.qty} × ${i.nameEn} (${(i.price * i.qty).toFixed(2)} €)`)
              .join("; ")
          );
          payload.append("subtotal", subtotal.toFixed(2));
          payload.append("deliveryFee", fee.toFixed(2));
          payload.append("total", Number(data.total).toFixed(2));
          fetch("/orders-form.html", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload.toString(),
          }).catch(() => {});
        } catch {
          // never block the customer on the notification path
        }
      }

      clear();
    } catch {
      setErrorMsg(t.checkout.error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "h-11 rounded-xl border-stone-200 focus-visible:ring-emerald-600";
  const fmt = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-stone-100 p-5">
          <SheetTitle className="flex items-center gap-2 text-lg">
            {step === "cart" && (
              <>
                <ShoppingBasket className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                {t.cart.title}
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">
                    {count}
                  </span>
                )}
              </>
            )}
            {step === "checkout" && t.checkout.title}
            {step === "success" && t.checkout.successTitle}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {step === "cart" ? t.cart.title : t.checkout.title}
          </SheetDescription>
        </SheetHeader>

        {/* ---------------- CART STEP ---------------- */}
        {step === "cart" &&
          (items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <ShoppingBasket className="h-8 w-8 text-stone-400" aria-hidden="true" />
              </span>
              <p className="text-lg font-semibold text-stone-800">{t.cart.empty}</p>
              <p className="text-sm text-stone-500">{t.cart.emptyHint}</p>
              <Button
                asChild
                className="mt-2 rounded-full bg-emerald-700 hover:bg-emerald-800"
                onClick={closeCart}
              >
                <a href="#shop">{t.cart.browse}</a>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="min-h-0 flex-1 px-5">
                <ul className="divide-y divide-stone-100 py-2">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-3 py-4">
                      <img
                        src={item.image}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {locale === "fi" ? item.nameFi : item.nameEn}
                        </p>
                        <p className="text-xs text-stone-400">{item.unit}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => setQty(item.productId, item.qty - 1)}
                              aria-label={t.cart.decrease}
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                              {item.qty}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => setQty(item.productId, item.qty + 1)}
                              aria-label={t.cart.increase}
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="ml-1 h-8 w-8 rounded-full text-stone-400 hover:text-red-600"
                              onClick={() => removeItem(item.productId)}
                              aria-label={t.cart.remove}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                          <span className="text-sm font-bold text-emerald-800">
                            {fmt(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="mx-auto mb-4 block text-xs text-stone-400 hover:text-red-600"
                >
                  {t.cart.clear}
                </Button>
              </ScrollArea>

              <SheetFooter className="border-t border-stone-100 p-5">
                {subtotal < FREE_THRESHOLD && (
                  <p className="mb-1 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                    <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t.cart.freeDeliveryHint}
                  </p>
                )}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-medium">{fmt(subtotal)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-bold text-stone-900">
                    <span>{t.cart.total}</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                </div>
                <Button
                  className="h-12 w-full rounded-full bg-amber-400 text-base font-semibold text-emerald-950 hover:bg-amber-300"
                  onClick={() => setStep("checkout")}
                >
                  {t.cart.checkout}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetFooter>
            </>
          ))}

        {/* ---------------- CHECKOUT STEP ---------------- */}
        {step === "checkout" && (
          <>
            <ScrollArea className="min-h-0 flex-1 px-5 py-4">
              <p className="text-sm text-stone-600">{t.checkout.subtitle}</p>

              {/* Contact */}
              <fieldset className="mt-5 space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {t.checkout.contactTitle}
                </legend>
                <div>
                  <Label htmlFor="co-name" className="text-sm">
                    {t.checkout.nameLabel} *
                  </Label>
                  <Input
                    id="co-name"
                    value={form.customerName}
                    onChange={(e) => set("customerName")(e.target.value)}
                    placeholder={t.checkout.namePlaceholder}
                    className={cn(inputCls, "mt-1")}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="co-phone" className="text-sm">
                    {t.checkout.phoneLabel} *
                  </Label>
                  <Input
                    id="co-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone")(e.target.value)}
                    placeholder={t.checkout.phonePlaceholder}
                    className={cn(inputCls, "mt-1")}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="co-email" className="text-sm">
                    {t.checkout.emailLabel}
                  </Label>
                  <Input
                    id="co-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    placeholder={t.checkout.emailPlaceholder}
                    className={cn(inputCls, "mt-1")}
                    autoComplete="email"
                  />
                </div>
              </fieldset>

              {/* Method */}
              <fieldset className="mt-5">
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {t.checkout.methodTitle}
                </legend>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod("delivery")}
                    aria-pressed={method === "delivery"}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                      method === "delivery"
                        ? "border-emerald-700 bg-emerald-50"
                        : "border-stone-200 hover:border-stone-300"
                    )}
                  >
                    <Truck
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        method === "delivery" ? "text-emerald-700" : "text-stone-400"
                      )}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-stone-900">
                        {t.checkout.delivery}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
                        {t.checkout.deliveryDesc}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("pickup")}
                    aria-pressed={method === "pickup"}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                      method === "pickup"
                        ? "border-emerald-700 bg-emerald-50"
                        : "border-stone-200 hover:border-stone-300"
                    )}
                  >
                    <Store
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        method === "pickup" ? "text-emerald-700" : "text-stone-400"
                      )}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-stone-900">
                        {t.checkout.pickup}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
                        {t.checkout.pickupDesc}
                      </span>
                    </span>
                  </button>
                </div>
              </fieldset>

              {/* Delivery address */}
              {method === "delivery" && (
                <fieldset className="mt-5 space-y-3">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {t.checkout.addressTitle}
                  </legend>
                  <div>
                    <Label htmlFor="co-address" className="text-sm">
                      {t.checkout.addressLabel} *
                    </Label>
                    <Input
                      id="co-address"
                      value={form.address}
                      onChange={(e) => set("address")(e.target.value)}
                      placeholder={t.checkout.addressPlaceholder}
                      className={cn(inputCls, "mt-1")}
                      autoComplete="street-address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="co-postal" className="text-sm">
                        {t.checkout.postalLabel} *
                      </Label>
                      <Input
                        id="co-postal"
                        value={form.postalCode}
                        onChange={(e) => set("postalCode")(e.target.value)}
                        placeholder="45100"
                        className={cn(inputCls, "mt-1")}
                        autoComplete="postal-code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="co-city" className="text-sm">
                        {t.checkout.cityLabel} *
                      </Label>
                      <Input
                        id="co-city"
                        value={form.city}
                        onChange={(e) => set("city")(e.target.value)}
                        className={cn(inputCls, "mt-1")}
                        autoComplete="address-level2"
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Notes */}
              <div className="mt-5">
                <Label htmlFor="co-notes" className="text-sm">
                  {t.checkout.notesLabel}
                </Label>
                <Textarea
                  id="co-notes"
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  placeholder={t.checkout.notesPlaceholder}
                  className="mt-1 min-h-20 rounded-xl border-stone-200 focus-visible:ring-emerald-600"
                />
              </div>

              {/* Summary */}
              <div className="mt-5 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {t.checkout.orderSummary}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-stone-700">
                  {items.map((i) => (
                    <li key={i.productId} className="flex justify-between gap-2">
                      <span className="truncate">
                        {i.qty} × {locale === "fi" ? i.nameFi : i.nameEn}
                      </span>
                      <span className="shrink-0 font-medium">{fmt(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>{t.cart.subtotal}</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{t.cart.deliveryFee}</span>
                    <span className={cn(fee === 0 && "font-semibold text-lime-600")}>
                      {fee === 0 ? t.cart.freeTag : fmt(fee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-base font-bold text-stone-900">
                    <span>{t.cart.total}</span>
                    <span>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
                >
                  {errorMsg}
                </p>
              )}
            </ScrollArea>

            <SheetFooter className="border-t border-stone-100 p-5">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-12 shrink-0 rounded-full border-stone-300 px-4 text-stone-600 hover:bg-stone-50"
                  onClick={() => {
                    setErrorMsg(null);
                    setStep("cart");
                  }}
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{t.checkout.backToCart}</span>
                </Button>
                <Button
                  className="h-12 flex-1 rounded-full bg-amber-400 text-base font-semibold text-emerald-950 hover:bg-amber-300"
                  onClick={submit}
                  disabled={submitting || items.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      {t.checkout.placing}
                    </>
                  ) : (
                    t.checkout.placeOrder
                  )}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}

        {/* ---------------- SUCCESS STEP ---------------- */}
        {step === "success" && success && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-100">
              <CheckCircle2 className="h-9 w-9 text-lime-600" aria-hidden="true" />
            </span>
            <div>
              <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-stone-900">
                <PartyPopper className="h-5 w-5 text-amber-500" aria-hidden="true" />
                {t.checkout.successTitle}
              </h2>
              <p className="mt-2 text-sm text-stone-600">{t.checkout.successText}</p>
            </div>
            <div className="w-full rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/70">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                {t.checkout.orderNo}
              </p>
              <p className="text-lg font-bold text-emerald-800">{success.orderNo}</p>
              <Separator className="my-3" />
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">{t.checkout.successTotal}</span>
                <span className="text-lg font-bold text-stone-900">{fmt(success.total)}</span>
              </div>
            </div>
            <Button
              className="mt-2 h-12 w-full rounded-full bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-800"
              onClick={() => {
                resetAll();
                closeCart();
              }}
            >
              {t.checkout.newOrder}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
