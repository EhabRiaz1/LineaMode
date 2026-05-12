import type { PipelineType, ProjectStatus } from "@/lib/pipelines/types";

export type AdminProjectRow = {
  id: string;
  pipeline_type: PipelineType;
  status: ProjectStatus;
  current_step?: string | null;
  brand_stage?: string | null;
  volume_bracket?: string | null;
  calendar_tier?: string | null;
  priorities?: string[] | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
    country: string | null;
  } | null;
};
