import { Suspense } from "react";
import { JournalEditor } from "@/components/admin/content/JournalEditor";

export const metadata = { title: "Edit entry · Admin" };

type Params = Promise<{ slug: string }>;

export default function EditJournalEntryPage({ params }: { params: Params }) {
  return (
    <Suspense>
      <ResolvedEditor params={params} />
    </Suspense>
  );
}

async function ResolvedEditor({ params }: { params: Params }) {
  const { slug } = await params;
  return <JournalEditor slug={slug} />;
}
