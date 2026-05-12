import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

type Params = Promise<{ slug: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { slug } = await params;
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .select(
        "slug, title, status, blocks, draft_blocks, seo, draft_seo, version, updated_at, published_at",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error) return respond.serverError("Failed to load page", error.message);
    if (!data) return respond.notFound("Page not found");
    return respond.ok({ page: data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load page",
      error instanceof Error ? error.message : String(error),
    );
  }
}
