import { Suspense } from "react";
import { ContentPageEditorView } from "@/components/admin/content/ContentPageEditorView";

export const metadata = { title: "Page Editor · Admin" };

export default function ContentPageEditorPage() {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading editor…</p>}>
      <ContentPageEditorView />
    </Suspense>
  );
}
