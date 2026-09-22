"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Settings = {
  shopName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  facebookUrl: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  deliveryFee: string;
  freeDeliveryThreshold: string;
  deliveryArea: string;
  contactNoteEn: string;
  contactNoteFi: string;
};

const EMPTY: Settings = {
  shopName: "",
  phone: "",
  email: "",
  address: "",
  postalCode: "",
  city: "",
  facebookUrl: "",
  hoursWeekdays: "",
  hoursSaturday: "",
  hoursSunday: "",
  deliveryFee: "",
  freeDeliveryThreshold: "",
  deliveryArea: "",
  contactNoteEn: "",
  contactNoteFi: "",
};

const field = "h-11 rounded-xl";
const labelCls = "text-sm font-semibold text-stone-700";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-stone-900">{title}</h2>
          <p className="text-xs text-stone-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function SiteSettingsForm() {
  const { toast } = useToast();
  const [values, setValues] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.ok) {
          const body = await res.json();
          const s = body.settings ?? {};
          setValues({
            shopName: s.shopName ?? "",
            phone: s.phone ?? "",
            email: s.email ?? "",
            address: s.address ?? "",
            postalCode: s.postalCode ?? "",
            city: s.city ?? "",
            facebookUrl: s.facebookUrl ?? "",
            hoursWeekdays: s.hoursWeekdays ?? "",
            hoursSaturday: s.hoursSaturday ?? "",
            hoursSunday: s.hoursSunday ?? "",
            deliveryFee: s.deliveryFee != null ? String(s.deliveryFee) : "",
            freeDeliveryThreshold: s.freeDeliveryThreshold != null ? String(s.freeDeliveryThreshold) : "",
            deliveryArea: s.deliveryArea ?? "",
            contactNoteEn: s.contactNoteEn ?? "",
            contactNoteFi: s.contactNoteFi ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key: keyof Settings, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          deliveryFee: Number(values.deliveryFee.replace(",", ".")),
          freeDeliveryThreshold: Number(values.freeDeliveryThreshold.replace(",", ".")),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({ title: "Settings saved", description: "The store now shows your new details." });
      } else {
        setError(body.error ?? "Saving failed. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-stone-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading settings…
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Site settings</h1>
          <p className="text-sm text-stone-500">
            Your shop&apos;s public details — shown on the contact page, footer and checkout.
          </p>
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="h-11 rounded-xl bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-800"
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2 h-4 w-4" aria-hidden="true" />}
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <Section
        icon={Store}
        title="Shop details"
        description="Name and address shown on the contact page, footer and in Google."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="shopName" className={labelCls}>Shop name</Label>
            <Input id="shopName" value={values.shopName} onChange={(e) => set("shopName", e.target.value)} className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebookUrl" className={labelCls}>Facebook page link</Label>
            <Input id="facebookUrl" value={values.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/…" className={field} />
          </div>
        </div>
      </Section>

      <Section
        icon={MapPin}
        title="Address"
        description="Where customers find you — also shown as the pickup location."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address" className={labelCls}>Street address</Label>
            <Input id="address" value={values.address} onChange={(e) => set("address", e.target.value)} placeholder="Kouvolankatu 34 A31" className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postalCode" className={labelCls}>Postal code</Label>
            <Input id="postalCode" value={values.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="45100" className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city" className={labelCls}>City</Label>
            <Input id="city" value={values.city} onChange={(e) => set("city", e.target.value)} placeholder="Kouvola" className={field} />
          </div>
        </div>
      </Section>

      <Section
        icon={Phone}
        title="Contact information"
        description="How customers reach you."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className={labelCls}>Phone number</Label>
            <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+358 45 …" className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelCls}>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email address
              </span>
            </Label>
            <Input id="email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="shop@example.com" className={field} />
          </div>
        </div>
      </Section>

      <Section
        icon={Clock}
        title="Opening hours"
        description="Shown on the contact page. Leave a field empty to keep the current time."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="hoursWeekdays" className={labelCls}>Monday – Friday</Label>
            <Input id="hoursWeekdays" value={values.hoursWeekdays} onChange={(e) => set("hoursWeekdays", e.target.value)} placeholder="10:00 – 22:00" className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hoursSaturday" className={labelCls}>Saturday</Label>
            <Input id="hoursSaturday" value={values.hoursSaturday} onChange={(e) => set("hoursSaturday", e.target.value)} placeholder="10:00 – 22:00" className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hoursSunday" className={labelCls}>Sunday</Label>
            <Input id="hoursSunday" value={values.hoursSunday} onChange={(e) => set("hoursSunday", e.target.value)} placeholder="12:00 – 18:00" className={field} />
          </div>
        </div>
      </Section>

      <Section
        icon={CreditCard}
        title="Delivery"
        description="The delivery fee is added automatically at checkout."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="deliveryFee" className={labelCls}>Delivery fee (€)</Label>
            <Input id="deliveryFee" type="number" step="0.10" min="0" inputMode="decimal" value={values.deliveryFee} onChange={(e) => set("deliveryFee", e.target.value)} placeholder="4.90" className={field} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="freeDeliveryThreshold" className={labelCls}>Free delivery from (€)</Label>
            <Input id="freeDeliveryThreshold" type="number" step="1" min="0" inputMode="decimal" value={values.freeDeliveryThreshold} onChange={(e) => set("freeDeliveryThreshold", e.target.value)} placeholder="40" className={field} />
            <p className="text-xs text-stone-500">Orders above this amount are delivered free.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deliveryArea" className={labelCls}>Delivery area</Label>
            <Input id="deliveryArea" value={values.deliveryArea} onChange={(e) => set("deliveryArea", e.target.value)} placeholder="Kouvola area" className={field} />
          </div>
        </div>
      </Section>

      <Section
        icon={MessageCircle}
        title="Contact page message"
        description="An optional welcome note on top of the contact page — in both languages."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contactNoteEn" className={labelCls}>In English</Label>
            <Textarea id="contactNoteEn" value={values.contactNoteEn} onChange={(e) => set("contactNoteEn", e.target.value)} placeholder="Welcome! Ask us anything about our products…" className="min-h-24 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactNoteFi" className={labelCls}>In Finnish</Label>
            <Textarea id="contactNoteFi" value={values.contactNoteFi} onChange={(e) => set("contactNoteFi", e.target.value)} placeholder="Tervetuloa! Kysy rohkeasti tuotteistamme…" className="min-h-24 rounded-xl" />
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={busy}
          className="h-11 rounded-xl bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-800"
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2 h-4 w-4" aria-hidden="true" />}
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
