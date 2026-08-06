import { JournalEditor } from "@/components/admin/content/JournalEditor";

export const metadata = { title: "Edit entry · Admin" };

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <JournalEditor slug={slug} />;
}
