"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBasket, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Login failed");
        setBusy(false);
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-stone-200/60">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <ShoppingBasket className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">Admin Panel</h1>
          <p className="mt-1 text-sm text-stone-500">Baraka Kauppa — store management</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Admin password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="h-11 rounded-xl pl-9"
                autoFocus
                required
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy || password.length === 0}
            className="h-11 w-full rounded-xl bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-800"
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-400">
          Not the store owner?{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">
            Back to the store
          </Link>
        </p>
      </div>
    </div>
  );
}
