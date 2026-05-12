import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { AdminsList } from "@/components/admin/settings/AdminsList";

export const metadata = { title: "Admin Accounts · Settings · Admin" };

export default function AdminsSettingsPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="09 / Settings"
        title="Admin accounts"
        subtitle="Manage team access and permissions."
        centered
      />
      <AdminsList />
    </div>
  );
}
