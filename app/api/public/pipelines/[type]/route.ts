import { connection } from "next/server";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { PIPELINE_TYPES, type PipelineType } from "@/lib/pipelines/types";

type Params = Promise<{ type: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  await connection();
  try {
    const { type } = await params;

    if (!PIPELINE_TYPES.includes(type as PipelineType)) {
      return respond.badRequest(`Invalid pipeline type: ${type}`);
    }

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_pipelines")
      .select("questions, version, is_active")
      .eq("pipeline_type", type)
      .maybeSingle();

    if (error) return respond.serverError("Failed to fetch pipeline", error.message);

    return respond.ok({ questions: data?.questions ?? [], version: data?.version ?? 1 });
  } catch (error) {
    return respond.serverError(
      "Failed to fetch pipeline",
      error instanceof Error ? error.message : String(error),
    );
  }
}
