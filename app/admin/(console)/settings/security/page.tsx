import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { TwoFactorSetup } from "@/components/admin/settings/TwoFactorSetup";

export const metadata = { title: "Security · Settings · Admin" };

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="09 / Settings"
        title="Security"
        subtitle="Two-factor authentication and account security settings."
        centered
      />
      <TwoFactorSetup />
    </div>
  );
}
