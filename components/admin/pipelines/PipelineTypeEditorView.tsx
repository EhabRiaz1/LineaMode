"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { PipelineFlowEditor } from "@/components/admin/pipelines/PipelineFlowEditor";
import { PIPELINE_TYPES } from "@/lib/pipelines/types";

const PIPELINE_INFO: Record<string, { title: string; eyebrow: string }> = {
  design_idea: { title: "From an idea", eyebrow: "01 / Design Idea" },
  design_scratch: { title: "From scratch", eyebrow: "02 / Design Scratch" },
  manufacture_existing: { title: "From a CAD", eyebrow: "03 / Manufacture" },
};

function resolveRouteType(raw: string | string[] | undefined): string | null {
  const type = Array.isArray(raw) ? raw[0] : raw;
  if (!type || type === "[type]") return null;
  return type;
}

export function PipelineTypeEditorView() {
  const params = useParams<{ type?: string | string[] }>();
  const type = resolveRouteType(params.type);

  if (!type) {
    return <p className="text-body text-ink/55">Loading pipeline…</p>;
  }

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
