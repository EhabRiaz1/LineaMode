import { Suspense } from "react";
import { connection } from "next/server";
import { ContentPageEditorView } from "@/components/admin/content/ContentPageEditorView";

export const metadata = { title: "Page Editor · Admin" };

type Props = { params: Promise<{ slug: string }> };

/**
 * `await connection()` is what actually keeps this off the prerender.
 *
 * Under Cache Components a dynamic route gets a fallback shell built against
 * the *literal* segment. A Suspense boundary alone was not enough: nothing in
 * this subtree touches a request-time API, so Next resolved the boundary at
 * build time using the fallback params and baked the result in. The deployed
 * route returned the fallback text *and* `"slug":"%5Bslug%5D"` together, with
 * `x-nextjs-prerender: 1` and `x-vercel-cache: HIT`, so the editor requested
 * /api/admin/cms/pages/%5Bslug%5D and 404'd.
 *
 * `connection()` excludes everything below it from prerendering, which is the
 * documented way to force runtime rendering when no request-time API is used.
 * `dynamic`/`dynamicParams` are removed under Cache Components, so this is the
 * supported lever. The Suspense boundary stays: it gives the shell something
 * to show while the real render streams in.
 */
async function Editor({ params }: Props) {
  await connection();
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
