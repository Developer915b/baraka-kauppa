"use client";

// Shown on /account when the visitor is not signed in. The button opens the
// global sign-in / sign-up popup — once they are signed in, the server-
// rendered account view replaces this gate without leaving the page.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/site/language-provider";
import { useAuth } from "@/components/site/auth-provider";

export function AccountGate() {
  const { t } = useLanguage();
  const { customer, openAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (customer) router.refresh();
  }, [customer, router]);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-20 pt-28">
      <div className="rounded-3xl bg-white p-6 text-center shadow-lg ring-1 ring-stone-200 sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white">
          <UserRound className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
          {t.auth.accountGateTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{t.auth.accountGateText}</p>
        <Button
          className="mt-5 h-11 w-full rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
          onClick={() => openAuth("signin")}
        >
          <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
          {t.auth.gateButton}
        </Button>
      </div>
    </div>
  );
}
