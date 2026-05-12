import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

type Params = Promise<{ slug: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { slug } = await params;
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_journal")
      .select(
        "slug, title, excerpt, body_mdx, category, read_time, status, cover_media_id, published_at, updated_at",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error) return respond.serverError("Failed to load entry", error.message);
    if (!data) return respond.notFound("Entry not found");
    return respond.ok({ entry: data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load entry",
      error instanceof Error ? error.message : String(error),
    );
  }
}
