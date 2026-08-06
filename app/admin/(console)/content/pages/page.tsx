import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { PagesListView } from "@/components/admin/content/PagesListView";

export const metadata = { title: "Pages · Admin" };

export default function PagesPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="05 / Pages"
        title="Site pages"
        subtitle="Manage content for customer-facing pages."
      />
      <PagesListView />
    </div>
  );
}
