import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/admin-login";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminSession()) {
    redirect("/admin/dashboard");
  }
  return <AdminLogin />;
}
