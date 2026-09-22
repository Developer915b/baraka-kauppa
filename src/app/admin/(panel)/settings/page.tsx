import { SiteSettingsForm } from "@/components/admin/settings-form";

export const metadata = {
  title: "Site settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SiteSettingsForm />;
}
