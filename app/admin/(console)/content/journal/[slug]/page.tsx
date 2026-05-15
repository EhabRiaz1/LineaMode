import { Suspense } from "react";
import { JournalEditor } from "@/components/admin/content/JournalEditor";

export const metadata = { title: "Edit entry · Admin" };

type Params = Promise<{ slug: string }>;

export default function EditJournalEntryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading editor…</p>}>
      {params.then(({ slug }) => (
        <JournalEditor slug={slug} />
      ))}
    </Suspense>
  );
}
