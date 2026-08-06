import { Suspense } from "react";
import { JournalEditor } from "@/components/admin/content/JournalEditor";

export const metadata = { title: "Edit entry · Admin" };

type Props = { params: Promise<{ slug: string }> };

/** params awaited behind Suspense — see content/pages/[slug]/page.tsx. */
async function Editor({ params }: Props) {
  const { slug } = await params;
  return <JournalEditor slug={slug} />;
}

export default function EditJournalEntryPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading editor…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}
