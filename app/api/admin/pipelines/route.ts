import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { PIPELINE_TYPES } from "@/lib/pipelines/types";

export type PipelineQuestion = {
  id: string;
  eyebrow: string;
  prompt: string;
  helper?: string;
  field: {
    kind: "text" | "email" | "tel" | "textarea" | "chips" | "files";
    placeholder?: string;
    rows?: number;
    multiple?: boolean;
    accept?: string;
    options?: { value: string; label: string }[];
  };
  path: string;
  required?: boolean;
};

export type PipelineRow = {
  id: string;
  pipeline_type: (typeof PIPELINE_TYPES)[number];
  version: number;
  is_active: boolean;
  questions: PipelineQuestion[];
  created_at: string;
  updated_at: string;
};

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("cms_pipelines")
      .select("*")
      .order("pipeline_type");

    if (error) {
      return respond.serverError("Unable to fetch pipelines", error.message);
    }

    return respond.ok({ pipelines: data ?? [] });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to fetch pipelines",
      error instanceof Error ? error.message : String(error),
    );
  }
}
