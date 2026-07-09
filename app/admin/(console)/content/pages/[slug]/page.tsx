import { Suspense } from "react";
import { ContentPageEditorView } from "@/components/admin/content/ContentPageEditorView";

export const metadata = { title: "Page Editor · Admin" };

type Props = { params: Promise<{ slug: string }> };

async function ResolvedEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentPageEditorView slug={slug} />;
}

export default function ContentPageEditorPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading editor…</p>}>
      <ResolvedEditor params={params} />
    </Suspense>
  );
}
