import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .select(
        "slug, title, status, version, updated_at, published_at, draft_blocks",
      )
      .order("slug", { ascending: true });
    if (error) {
      return respond.serverError("Unable to list pages", error.message);
    }
    const rows = (data ?? []).map((row) => ({
      slug: row.slug,
      title: row.title,
      status: row.status,
      version: row.version,
      updated_at: row.updated_at,
      published_at: row.published_at,
      has_draft: row.draft_blocks !== null,
    }));
    return respond.ok({ pages: rows });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to list pages",
      error instanceof Error ? error.message : String(error),
    );
  }
}
