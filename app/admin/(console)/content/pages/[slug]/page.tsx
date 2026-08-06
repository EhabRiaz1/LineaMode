import { ContentPageEditorView } from "@/components/admin/content/ContentPageEditorView";

export const metadata = { title: "Page Editor · Admin" };

export default async function ContentPageEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentPageEditorView slug={slug} />;
}
