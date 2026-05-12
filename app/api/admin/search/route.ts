import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return respond.ok({ hits: [] });
    }

    const supabase = getServiceRoleClient();
    const term = `%${q}%`;
    const { data, error } = await supabase
      .from("admin_search")
      .select("kind, id, title, subtitle, updated_at")
      .or(`title.ilike.${term},subtitle.ilike.${term}`)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      return respond.serverError("Search failed", error.message);
    }

    return respond.ok({ hits: data ?? [] });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Search failed",
      error instanceof Error ? error.message : String(error),
    );
  }
}
