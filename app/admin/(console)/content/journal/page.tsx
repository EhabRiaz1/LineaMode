import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { JournalListView } from "@/components/admin/content/JournalListView";

export const metadata = { title: "Journal · Admin" };

export default function JournalPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="06 / Journal"
        title="Journal entries"
        subtitle="Manage editorial content and field essays."
        centered
      />
      <JournalListView />
    </div>
  );
}
