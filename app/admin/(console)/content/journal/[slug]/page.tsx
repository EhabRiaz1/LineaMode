import { JournalEditor } from "@/components/admin/content/JournalEditor";

export const metadata = { title: "Edit entry · Admin" };

type Params = Promise<{ slug: string }>;

export default async function EditJournalEntryPage({ params }: { params: Params }) {
  const { slug } = await params;
  return <JournalEditor slug={slug} />;
}
