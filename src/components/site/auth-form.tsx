"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, ShoppingBasket, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/site/language-provider";
import { cn } from "@/lib/utils";

export type AuthCustomer = { id: number; email: string; name: string; phone: string | null };

type AuthFormProps = {
  /** "page" renders the standalone card (legacy pages); "modal" renders inside the auth popup. */
  variant?: "page" | "modal";
  initialMode?: "signin" | "create";
  /** Where to go after success in page mode (ignored when onAuthed is given). */
  redirectTo?: string;
  /** Called after a successful sign-in / registration (popup mode). */
  onAuthed?: (customer: AuthCustomer) => void;
  /** Replaces the "continue shopping" link, e.g. to just close the popup. */
  onBrowse?: () => void;
};

export function AuthForm({
  variant = "page",
  initialMode = "signin",
  redirectTo = "/account",
  onAuthed,
  onBrowse,
}: AuthFormProps) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [mode, setMode] = useState<"signin" | "create">(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signin"
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, phone: form.phone, password: form.password }
        ),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        if (onAuthed) {
          // Popup mode: hand the signed-in customer to the provider and stay
          // exactly where the visitor is (checkout, shop, …).
          onAuthed((body?.customer ?? null) as AuthCustomer);
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        setError(body.error ?? t.account.signInError);
      }
    } catch {
      setError(locale === "fi" ? "Yhteys katkesi — yritä uudelleen." : "Connection lost — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const field = "h-11 rounded-xl";
  const labelCls = "text-sm font-semibold text-stone-700";
  const isModal = variant === "modal";

  return (
    <div
      className={cn(
        isModal
          ? "px-6 pb-6 pt-2 sm:px-8 sm:pb-8"
          : "rounded-3xl bg-white p-6 shadow-lg ring-1 ring-stone-200 sm:p-8"
      )}
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white">
          <ShoppingBasket className="h-6 w-6" aria-hidden="true" />
        </span>
        {isModal ? (
          <h2 className="mt-3 text-xl font-bold tracking-tight text-stone-900">
            {mode === "signin" ? t.account.signInTitle : t.account.createTitle}
          </h2>
        ) : (
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
            {mode === "signin" ? t.account.signInTitle : t.account.createTitle}
          </h1>
        )}
        <p className="mt-1 text-sm text-stone-500">
          {mode === "signin" ? t.account.signInSubtitle : t.account.createSubtitle}
        </p>
      </div>

      {/* Mode tabs */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-stone-100 p-1">
        {(["signin", "create"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            aria-pressed={mode === m}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              mode === m ? "bg-emerald-700 text-white shadow-sm" : "text-stone-600 hover:text-emerald-800"
            )}
          >
            {m === "signin" ? t.account.signIn : t.account.createAccount}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "create" && (
          <div className="space-y-1.5">
            <Label htmlFor="authName" className={labelCls}>{t.account.name}</Label>
            <Input
              id="authName"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t.checkout.namePlaceholder}
              className={field}
              required
              minLength={2}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="authEmail" className={labelCls}>{t.account.email}</Label>
          <Input
            id="authEmail"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            className={field}
            required
          />
        </div>
        {mode === "create" && (
          <div className="space-y-1.5">
            <Label htmlFor="authPhone" className={labelCls}>{t.account.phone}</Label>
            <Input
              id="authPhone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder={t.checkout.phonePlaceholder}
              className={field}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="authPassword" className={labelCls}>{t.account.password}</Label>
          <Input
            id="authPassword"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className={field}
            required
            minLength={6}
          />
          {mode === "create" && <p className="text-xs text-stone-500">{t.account.passwordHint}</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : mode === "signin" ? (
            <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {busy ? t.account.processing : mode === "signin" ? t.account.signIn : t.account.createAccount}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500">
        {mode === "signin" ? (
          <>
            {t.account.noAccount}{" "}
            <button
              type="button"
              onClick={() => setMode("create")}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {t.account.createAccount}
            </button>
          </>
        ) : (
          <>
            {t.account.haveAccount}{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {t.account.signIn}
            </button>
          </>
        )}
      </p>

      {!isModal && (
        <p className="mt-4 text-center text-xs text-stone-400">
          <Link href="/shop" className="hover:underline">
            {locale === "fi" ? "Jatka ostoksia ilman tiliä →" : "Continue shopping without an account →"}
          </Link>
        </p>
      )}
      {isModal && onBrowse && (
        <p className="mt-4 text-center text-xs text-stone-400">
          <button type="button" onClick={onBrowse} className="hover:underline">
            {locale === "fi" ? "Jatka ostoksia ilman tiliä →" : "Continue shopping without an account →"}
          </button>
        </p>
      )}
    </div>
  );
}
