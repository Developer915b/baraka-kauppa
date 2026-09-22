"use client";

// Client-side customer account state + the global sign-in / sign-up popup.
//
// The provider keeps track of who is signed in (from /api/auth/me), lets any
// part of the site open the auth popup, and — importantly — never navigates
// the visitor away: after signing in from the cart, a product page or the
// account page, they simply continue what they were doing.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthForm, type AuthCustomer } from "@/components/site/auth-form";
import { useLanguage } from "@/components/site/language-provider";

type AuthMode = "signin" | "create";

type AuthContextValue = {
  customer: AuthCustomer | null;
  /** True while the first /api/auth/me lookup is in flight. */
  loading: boolean;
  /** False when the deployment has no customer-account database (guest fallback). */
  authAvailable: boolean;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [customer, setCustomer] = useState<AuthCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const body = await res.json().catch(() => null);
      setCustomer(body?.customer ?? null);
      if (typeof body?.authAvailable === "boolean") setAuthAvailable(body.authAvailable);
    } catch {
      // Network hiccup — keep whatever state we already have.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openAuth = useCallback((m: AuthMode = "signin") => {
    setMode(m);
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => setOpen(false), []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // even if the call fails, drop the local session state
    }
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({ customer, loading, authAvailable, openAuth, closeAuth, signOut, refresh }),
    [customer, loading, authAvailable, openAuth, closeAuth, signOut, refresh]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Global sign-in / sign-up popup — the visitor stays on their page. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {mode === "signin" ? t.account.signInTitle : t.account.createTitle}
            </DialogTitle>
            <DialogDescription>
              {mode === "signin" ? t.account.signInSubtitle : t.account.createSubtitle}
            </DialogDescription>
          </DialogHeader>
          {open && (
            <AuthForm
              variant="modal"
              initialMode={mode}
              onAuthed={(c) => {
                setCustomer(c);
                setOpen(false);
              }}
              onBrowse={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}
