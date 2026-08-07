import { Suspense } from "react";
import { connection } from "next/server";
import { PipelineTypeEditorView } from "@/components/admin/pipelines/PipelineTypeEditorView";

type Props = { params: Promise<{ type: string }> };

const PIPELINE_INFO: Record<string, { title: string; eyebrow: string }> = {
  design_idea: { title: "From an idea", eyebrow: "01 / Design Idea" },
  design_scratch: { title: "From scratch", eyebrow: "02 / Design Scratch" },
  manufacture_existing: { title: "From a CAD", eyebrow: "03 / Manufacture" },
};

export async function generateMetadata({ params }: Props) {
  const { type } = await params;
  const info = PIPELINE_INFO[type];
  return { title: info ? `${info.title} · Pipelines · Admin` : "Pipeline · Admin" };
}

/** connection() + Suspense keeps this off the prerender — see content/pages/[slug]/page.tsx. */
async function Editor({ params }: Props) {
  await connection();
  const { type } = await params;
  return <PipelineTypeEditorView type={type} />;
}

export default function PipelineEditorPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading pipeline…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}
