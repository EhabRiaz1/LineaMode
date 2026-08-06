import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { InboxFeed } from "@/components/admin/inbox/InboxFeed";

export const metadata = { title: "Inbox · Admin" };

export default function InboxPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="01 / Inbox"
        title="Recent submissions"
        subtitle="Client inquiries from the past two weeks, organized by date."
      />
      <InboxFeed />
    </div>
  );
}
