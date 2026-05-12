import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const supabase = getServiceRoleClient();

    let query = supabase
      .from("customers")
      .select(
        "id, email, name, company, country, tags, created_at, projects(count)",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (search) {
      const term = `%${search}%`;
      query = query.or(`email.ilike.${term},name.ilike.${term},company.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) {
      return respond.serverError("Unable to fetch clients", error.message);
    }

    type Row = { projects?: { count: number }[] };
    const rows = (data ?? []).map((row) => {
      const r = row as unknown as Row;
      return {
        ...row,
        project_count: r.projects?.[0]?.count ?? 0,
      };
    });

    return respond.ok({ clients: rows });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to fetch clients",
      error instanceof Error ? error.message : String(error),
    );
  }
}
