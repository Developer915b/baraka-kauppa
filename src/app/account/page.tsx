import type { Metadata } from "next";
import { AccountView, type AccountCustomer } from "@/components/site/account-view";
import { AuthForm } from "@/components/site/auth-form";
import { getCustomerIdFromSession } from "@/lib/customer-auth";
import { sbFetch } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customerId = await getCustomerIdFromSession();

  if (!customerId) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-20 pt-10">
        <AuthForm />
      </div>
    );
  }

  let customer: AccountCustomer | null = null;
  try {
    const rows = await sbFetch<{ id: number; email: string; name: string; phone: string | null; created_at?: string }[]>({
      path: `/customers?select=id,email,name,phone,created_at&id=eq.${customerId}&limit=1`,
      write: true,
    });
    if (rows.length > 0) {
      customer = {
        id: Number(rows[0].id),
        email: rows[0].email,
        name: rows[0].name,
        phone: rows[0].phone,
        createdAt: rows[0].created_at ?? null,
      };
    }
  } catch {
    customer = null;
  }

  if (!customer) {
    // Session cookie valid but the customer row is gone (e.g. settings reset).
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-20 pt-10">
        <AuthForm />
      </div>
    );
  }

  return <AccountView customer={customer} />;
}
