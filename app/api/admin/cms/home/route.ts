import { respond } from "@/lib/api/responses";
import {
  getServiceRoleClient,
  requireAdminUser,
  UnauthorizedError,
} from "@/lib/supabase/client";
import { parseHomeContent } from "@/lib/cms/home-schema";
import { connection } from "next/server";

export async function GET(request: Request) {
  await connection();
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();

    const [{ data: publishedRow }, { data: draftRow }] = await Promise.all([
      supabase.from("cms_settings").select("value").eq("key", "home_content").maybeSingle(),
      supabase
        .from("cms_settings")
        .select("value")
        .eq("key", "home_content_draft")
        .maybeSingle(),
    ]);

    return respond.ok({
      published: publishedRow ? parseHomeContent(publishedRow.value) : null,
      draft: draftRow ? parseHomeContent(draftRow.value) : null,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load home content",
      error instanceof Error ? error.message : String(error),
    );
  }
}
