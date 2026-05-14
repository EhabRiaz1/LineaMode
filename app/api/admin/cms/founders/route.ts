import { connection } from "next/server";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { parseFoundersContent } from "@/lib/cms/founders-schema";

export async function GET(request: Request) {
  await connection();
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const sb = getServiceRoleClient();
    const [{ data: pub }, { data: draft }] = await Promise.all([
      sb.from("cms_settings").select("value").eq("key", "founders_content").maybeSingle(),
      sb.from("cms_settings").select("value").eq("key", "founders_content_draft").maybeSingle(),
    ]);
    return respond.ok({
      published: pub ? parseFoundersContent(pub.value) : null,
      draft: draft ? parseFoundersContent(draft.value) : null,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError("Failed to load founders content", error instanceof Error ? error.message : String(error));
  }
}
