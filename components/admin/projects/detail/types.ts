import type { PipelineType, ProjectStatus, StepState } from "@/lib/pipelines/types";

export type ProjectDetail = {
  id: string;
  pipeline_type: PipelineType;
  status: ProjectStatus;
  current_step: string | null;
  brief: Record<string, unknown> | null;
  brand_stage: string | null;
  volume_bracket: string | null;
  calendar_tier: string | null;
  priorities: string[] | null;
  assigned_admin_id: string | null;
  created_at: string;
  updated_at: string;
  customers: {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
    country: string | null;
    phone: string | null;
    attribution: Record<string, unknown> | null;
    device: Record<string, unknown> | null;
  } | null;
  enquiries: {
    id: string;
    intake: Record<string, unknown>;
    notes: string | null;
    created_at: string;
  }[];
  attachments: {
    id: string;
    file_name: string;
    file_type: string | null;
    file_size_bytes: number | null;
    storage_path: string;
    created_at: string;
  }[];
  pipeline_steps: {
    id: string;
    label: string;
    state: StepState;
    note: string | null;
    actor_id: string | null;
    actor_role: string | null;
    created_at: string;
  }[];
  project_notes: {
    id: string;
    body: string;
    author_id: string | null;
    created_at: string;
    updated_at: string;
  }[];
};
