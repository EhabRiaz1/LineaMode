import { Suspense } from "react";
import { ContentPageEditorView } from "@/components/admin/content/ContentPageEditorView";

export const metadata = { title: "Page Editor · Admin" };

type Props = { params: Promise<{ slug: string }> };

export default function ContentPageEditorPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading editor…</p>}>
      {params.then(({ slug }) => (
        <ContentPageEditorView key={slug} slug={slug} />
      ))}
    </Suspense>
  );
}
