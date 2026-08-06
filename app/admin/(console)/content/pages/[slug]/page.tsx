import { Suspense } from "react";
import { ContentPageEditorView } from "@/components/admin/content/ContentPageEditorView";

export const metadata = { title: "Page Editor · Admin" };

type Props = { params: Promise<{ slug: string }> };

/**
 * `params` is awaited inside a Suspense boundary, not in the page body.
 *
 * Under Cache Components a route's shell is prerendered, and awaiting params
 * outside a boundary bakes the *literal* segment into that shell. Vercel then
 * serves the cached shell for every slug — we saw it return
 * `"slug":"%5Bslug%5D"` with `x-vercel-cache: HIT`, which made the editor
 * request /api/admin/cms/pages/%5Bslug%5D and 404. Keeping the await behind
 * Suspense leaves only the fallback in the shell and streams the real slug
 * per request. `dynamic`/`dynamicParams` are removed under Cache Components,
 * so this boundary is the supported way to opt the subtree out.
 */
async function Editor({ params }: Props) {
  const { slug } = await params;
  return <ContentPageEditorView slug={slug} />;
}

export default function ContentPageEditorPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading editor…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}
