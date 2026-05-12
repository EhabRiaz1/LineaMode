import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { PIPELINE_TYPES, PROJECT_STATUSES } from "@/lib/pipelines/types";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const pipelineType = searchParams.get("pipelineType");
    const search = searchParams.get("search");
    const daysRaw = searchParams.get("days");
    const days = daysRaw ? Number.parseInt(daysRaw, 10) : null;

    if (status && !PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])) {
      return respond.badRequest("Invalid status filter");
    }
    if (pipelineType && !PIPELINE_TYPES.includes(pipelineType as (typeof PIPELINE_TYPES)[number])) {
      return respond.badRequest("Invalid pipelineType filter");
    }
    if (days !== null && (Number.isNaN(days) || days < 1 || days > 365)) {
      return respond.badRequest("Invalid days range (1–365)");
    }

    let query = supabase
      .from("projects")
      .select(
        `
        id,
        pipeline_type,
        status,
        current_step,
        brand_stage,
        volume_bracket,
        calendar_tier,
        priorities,
        created_at,
        updated_at,
        customers:customer_id (id, name, email, company, country)
      `
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (status) query = query.eq("status", status);
    if (pipelineType) query = query.eq("pipeline_type", pipelineType);
    if (days !== null) {
      const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      query = query.gte("created_at", since);
    }
    if (search) {
      // Fan-in via customer search: fetch matching customer ids first then
      // filter projects by them. Avoids the foreign-table .or() syntax which
      // PostgREST handles inconsistently.
      const term = `%${search}%`;
      const { data: matchedCustomers } = await supabase
        .from("customers")
        .select("id")
        .or(`email.ilike.${term},name.ilike.${term},company.ilike.${term}`)
        .limit(50);
      const ids = (matchedCustomers ?? []).map((c) => c.id);
      if (ids.length === 0) {
        return respond.ok({ projects: [] });
      }
      query = query.in("customer_id", ids);
    }

    const { data, error } = await query;
    if (error) {
      return respond.serverError("Unable to fetch projects", error.message);
    }

    return respond.ok({ projects: data ?? [] });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to fetch projects",
      error instanceof Error ? error.message : String(error)
    );
  }
}
