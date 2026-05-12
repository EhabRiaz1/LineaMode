import { JournalEditor } from "@/components/admin/content/JournalEditor";

export const metadata = { title: "New entry · Admin" };

export default function NewJournalEntryPage() {
  return <JournalEditor slug={null} />;
}
