import { notFound } from "next/navigation";
import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { PipelineFlowEditor } from "@/components/admin/pipelines/PipelineFlowEditor";
import { PIPELINE_TYPES } from "@/lib/pipelines/types";

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

export default async function PipelineEditorPage({ params }: Props) {
  const { type } = await params;

  if (!PIPELINE_TYPES.includes(type as (typeof PIPELINE_TYPES)[number])) {
    notFound();
  }

  const info = PIPELINE_INFO[type] ?? { title: type, eyebrow: "Pipeline" };

  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow={info.eyebrow}
        title={info.title}
        subtitle="Drag to reorder questions. Click any card to edit its content."
      />
      <PipelineFlowEditor pipelineType={type as (typeof PIPELINE_TYPES)[number]} />
    </div>
  );
}
