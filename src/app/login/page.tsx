import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/site/auth-form";
import { getCustomerIdFromSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getCustomerIdFromSession()) {
    redirect("/account");
  }
  return (
    <div className="mx-auto w-full max-w-md px-4 pb-20 pt-10">
      <AuthForm />
    </div>
  );
}
