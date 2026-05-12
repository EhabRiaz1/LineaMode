import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_journal")
      .select("slug, title, status, category, published_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) return respond.serverError("Failed to load journal", error.message);
    return respond.ok({ entries: data ?? [] });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to list journal",
      error instanceof Error ? error.message : String(error),
    );
  }
}
