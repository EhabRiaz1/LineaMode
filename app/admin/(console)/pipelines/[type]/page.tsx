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

export default async function PipelineEditorPage({ params }: Props) {
  const { type } = await params;
  return <PipelineTypeEditorView type={type} />;
}
