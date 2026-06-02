import { respond } from "@/lib/api/responses";
import { PIPELINE_TYPES, PROJECT_STATUSES, type PipelineType, type ProjectStatus } from "@/lib/pipelines/types";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

const PIPELINE_LABELS: Record<PipelineType, string> = {
  design_idea: "From an idea",
  design_scratch: "From scratch",
  manufacture_existing: "From a CAD",
  contact_form: "Contact form",
};

const PIPELINE_COLORS: Record<PipelineType, string> = {
  design_idea: "bg-terracotta",
  design_scratch: "bg-moss",
  manufacture_existing: "bg-graphite",
  contact_form: "bg-ink/40",
};

const FUNNEL_COLORS = ["bg-ink/15", "bg-ink/30", "bg-ink/50", "bg-terracotta/60", "bg-terracotta"];

type CountFilter =
  | { column: "status"; values: ProjectStatus[] }
  | { column: "pipeline_type"; values: PipelineType[] };

type RecentCustomerRow = {
  name: string | null;
  email: string;
  company: string | null;
};

type RecentProjectRow = {
  id: string;
  pipeline_type: PipelineType;
  status: ProjectStatus;
  current_step: string | null;
  created_at: string;
  updated_at: string;
  customers: RecentCustomerRow | RecentCustomerRow[] | null;
};

function startOfWeek() {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  const day = date.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString();
}

async function countProjects(
  supabase: ReturnType<typeof getServiceRoleClient>,
  opts: { since?: string; filter?: CountFilter } = {},
) {
  let query = supabase.from("projects").select("id", { count: "exact", head: true });

  if (opts.since) query = query.gte("created_at", opts.since);
  if (opts.filter) query = query.in(opts.filter.column, opts.filter.values);

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function countUniqueEventSessions(
  supabase: ReturnType<typeof getServiceRoleClient>,
  events: string[],
) {
  const { data, error } = await supabase
    .from("intake_events")
    .select("session_id")
    .in("event", events)
    .not("session_id", "is", null)
    .limit(10000);

  if (error) return 0;
  return new Set((data ?? []).map((row) => row.session_id).filter(Boolean)).size;
}

function relativeTime(value: string) {
  const deltaMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(deltaMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();

    const pipelineCountTasks = PIPELINE_TYPES.map(async (type) => ({
      type,
      label: PIPELINE_LABELS[type],
      count: await countProjects(supabase, { filter: { column: "pipeline_type", values: [type] } }),
      color: PIPELINE_COLORS[type],
    }));
    const statusCountTasks = PROJECT_STATUSES.map(async (status) => ({
      status,
      count: await countProjects(supabase, { filter: { column: "status", values: [status] } }),
    }));
    const recentProjectsTask = supabase
      .from("projects")
      .select(
        `
        id,
        pipeline_type,
        status,
        current_step,
        created_at,
        updated_at,
        customers:customer_id (name, email, company)
      `,
      )
      .order("updated_at", { ascending: false })
      .limit(5);

    const [
      totalIntakes,
      thisWeek,
      pendingReview,
      activeProjects,
      pipelineCounts,
      statusCounts,
      startedSessions,
      recentResult,
    ] = await Promise.all([
      countProjects(supabase),
      countProjects(supabase, { since: startOfWeek() }),
      countProjects(supabase, { filter: { column: "status", values: ["draft", "reviewing"] } }),
      countProjects(supabase, { filter: { column: "status", values: ["quoted", "in_progress"] } }),
      Promise.all(pipelineCountTasks),
      Promise.all(statusCountTasks),
      countUniqueEventSessions(supabase, ["landed", "pipeline_chosen", "letter_started"]),
      recentProjectsTask,
    ]);

    const pipelineTotal = pipelineCounts.reduce((sum, item) => sum + item.count, 0);

    const byStatus = Object.fromEntries(statusCounts.map((item) => [item.status, item.count])) as Record<ProjectStatus, number>;
    const started = Math.max(startedSessions, totalIntakes);

    if (recentResult.error) throw new Error(recentResult.error.message);

    const recentProjects = ((recentResult.data ?? []) as unknown as RecentProjectRow[]).map((project) => {
      const customer = Array.isArray(project.customers) ? project.customers[0] : project.customers;
      return {
        id: project.id,
        name: customer?.company || customer?.name || customer?.email || "Unnamed project",
        client: customer?.name || customer?.email || "Unknown client",
        stage: project.status,
        pipeline: project.pipeline_type,
        updated: relativeTime(project.updated_at),
        updated_at: project.updated_at,
      };
    });

    return respond.ok({
      quickStats: {
        total_intakes: totalIntakes,
        this_week: thisWeek,
        pending_review: pendingReview,
        active_projects: activeProjects,
      },
      intakeFunnel: [
        { stage: "Started", count: started, color: FUNNEL_COLORS[0] },
        { stage: "Submitted", count: totalIntakes, color: FUNNEL_COLORS[1] },
        { stage: "Reviewing", count: byStatus.reviewing + byStatus.quoted + byStatus.in_progress + byStatus.delivered, color: FUNNEL_COLORS[2] },
        { stage: "Quoted", count: byStatus.quoted + byStatus.in_progress + byStatus.delivered, color: FUNNEL_COLORS[3] },
        { stage: "Active", count: byStatus.in_progress + byStatus.delivered, color: FUNNEL_COLORS[4] },
      ],
      pipelineDistribution: pipelineCounts.map((item) => ({
        ...item,
        percentage: pipelineTotal > 0 ? Math.round((item.count / pipelineTotal) * 100) : 0,
      })),
      recentProjects,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load dashboard stats",
      error instanceof Error ? error.message : String(error),
    );
  }
}
