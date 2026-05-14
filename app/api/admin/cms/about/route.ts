import { connection } from "next/server";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { parseAboutContent } from "@/lib/cms/about-schema";

export async function GET(request: Request) {
  await connection();
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const sb = getServiceRoleClient();
    const [{ data: pub }, { data: draft }] = await Promise.all([
      sb.from("cms_settings").select("value").eq("key", "about_content").maybeSingle(),
      sb.from("cms_settings").select("value").eq("key", "about_content_draft").maybeSingle(),
    ]);
    return respond.ok({
      published: pub ? parseAboutContent(pub.value) : null,
      draft: draft ? parseAboutContent(draft.value) : null,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError("Failed to load about content", error instanceof Error ? error.message : String(error));
  }
}
