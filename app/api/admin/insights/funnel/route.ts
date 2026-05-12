import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();

    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

    const [eventsRes, customersRes, projectsRes] = await Promise.all([
      supabase
        .from("intake_events")
        .select("event, payload")
        .gte("occurred_at", since)
        .limit(10000),
      supabase
        .from("customers")
        .select("attribution")
        .gte("created_at", since)
        .limit(2000),
      supabase
        .from("projects")
        .select("pipeline_type")
        .gte("created_at", since)
        .limit(2000),
    ]);

    if (eventsRes.error) {
      return respond.serverError("Failed to read events", eventsRes.error.message);
    }

    type EventRow = { event: string; payload: unknown };
    const eventsBySession = new Map<string, Set<string>>();
    const totals = {
      landed: 0,
      chose_pipeline: 0,
      started_letter: 0,
      submitted: 0,
    };
    for (const row of (eventsRes.data ?? []) as EventRow[]) {
      const sessionId =
        row.payload && typeof row.payload === "object" && row.payload !== null && "session_id" in row.payload
          ? String((row.payload as Record<string, unknown>).session_id ?? "")
          : "";
      if (!sessionId) continue;
      if (!eventsBySession.has(sessionId)) eventsBySession.set(sessionId, new Set());
      eventsBySession.get(sessionId)!.add(row.event);
    }
    for (const events of eventsBySession.values()) {
      if (events.has("landed")) totals.landed += 1;
      if (events.has("pipeline_chosen")) totals.chose_pipeline += 1;
      if (events.has("letter_started")) totals.started_letter += 1;
      if (events.has("intake_submitted")) totals.submitted += 1;
    }

    type AttributionRow = { attribution: { utm_source?: string } | null };
    const sourceMap = new Map<string | null, number>();
    for (const row of (customersRes.data ?? []) as AttributionRow[]) {
      const source = row.attribution?.utm_source ?? null;
      sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
    }
    const sources = Array.from(sourceMap.entries())
      .map(([utm_source, count]) => ({ utm_source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    type PipelineRow = { pipeline_type: string };
    const pipelineMap = new Map<string, number>();
    for (const row of (projectsRes.data ?? []) as PipelineRow[]) {
      pipelineMap.set(row.pipeline_type, (pipelineMap.get(row.pipeline_type) ?? 0) + 1);
    }
    const by_pipeline = Array.from(pipelineMap.entries())
      .map(([pipeline_type, count]) => ({ pipeline_type, count }))
      .sort((a, b) => b.count - a.count);

    return respond.ok({ totals, sources, by_pipeline });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to compute insights",
      error instanceof Error ? error.message : String(error),
    );
  }
}
