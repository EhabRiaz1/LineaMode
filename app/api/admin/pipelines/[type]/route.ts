import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { PIPELINE_TYPES, type PipelineType } from "@/lib/pipelines/types";
import { normalizePipelineFields, type LetterField } from "@/lib/start/schema";
import type { PipelineQuestion } from "../route";

type Context = { params: Promise<{ type: string }> };

export async function GET(request: Request, context: Context) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { type } = await context.params;

    if (!PIPELINE_TYPES.includes(type as PipelineType)) {
      return respond.badRequest(`Invalid pipeline type: ${type}`);
    }

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_pipelines")
      .select("*")
      .eq("pipeline_type", type)
      .single();

    if (error && error.code !== "PGRST116") {
      return respond.serverError("Unable to fetch pipeline", error.message);
    }

    const pipeline = data
      ? {
          ...data,
          questions: Array.isArray(data.questions)
            ? normalizePipelineFields(type as PipelineType, data.questions as LetterField[])
                .map(({ step: _step, ...question }) => question)
            : [],
        }
      : data;

    return respond.ok({ pipeline });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to fetch pipeline",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { type } = await context.params;

    if (!PIPELINE_TYPES.includes(type as PipelineType)) {
      return respond.badRequest(`Invalid pipeline type: ${type}`);
    }

    const body = await request.json();
    const { questions, is_active } = body as {
      questions?: PipelineQuestion[];
      is_active?: boolean;
    };

    const supabase = getServiceRoleClient();

    // Get existing pipeline to increment version
    const { data: existing } = await supabase
      .from("cms_pipelines")
      .select("version")
      .eq("pipeline_type", type)
      .single();

    const updates: Record<string, unknown> = {
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    };

    if (questions !== undefined) {
      updates.questions = normalizePipelineFields(
        type as PipelineType,
        questions.map((question, index) => ({ ...question, step: index + 1 }) as LetterField),
      ).map(({ step: _step, ...question }) => question);
      updates.version = (existing?.version ?? 0) + 1;
    }

    if (is_active !== undefined) {
      updates.is_active = is_active;
    }

    const { data, error } = await supabase
      .from("cms_pipelines")
      .upsert(
        {
          pipeline_type: type,
          ...updates,
        },
        { onConflict: "pipeline_type" }
      )
      .select()
      .single();

    if (error) {
      return respond.serverError("Unable to update pipeline", error.message);
    }

    return respond.ok({ pipeline: data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to update pipeline",
      error instanceof Error ? error.message : String(error),
    );
  }
}
