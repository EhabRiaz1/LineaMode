import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { PageVisibilityEditor } from "@/components/admin/settings/PageVisibilityEditor";

export const metadata = { title: "Page Visibility · Settings · Admin" };

export default function PageVisibilityPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="09 / Settings"
        title="Page visibility"
        subtitle="Control which pages appear in the navigation and on the homepage."
      />
      <PageVisibilityEditor />
    </div>
  );
}
