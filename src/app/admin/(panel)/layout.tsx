import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) {
    redirect("/admin");
  }
  return <AdminShell>{children}</AdminShell>;
}
