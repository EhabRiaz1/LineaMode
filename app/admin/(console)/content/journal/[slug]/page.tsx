import { Suspense } from "react";
import { connection } from "next/server";
import { JournalEditor } from "@/components/admin/content/JournalEditor";

export const metadata = { title: "Edit entry · Admin" };

type Props = { params: Promise<{ slug: string }> };

/** connection() + Suspense keeps this off the prerender — see content/pages/[slug]/page.tsx. */
async function Editor({ params }: Props) {
  await connection();
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
