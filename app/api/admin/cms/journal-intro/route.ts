import { connection } from "next/server";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { parseJournalIntro } from "@/lib/cms/journal-intro-schema";

export async function GET(request: Request) {
  await connection();
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const sb = getServiceRoleClient();
    const [{ data: pub }, { data: draft }] = await Promise.all([
      sb.from("cms_settings").select("value").eq("key", "journal_intro").maybeSingle(),
      sb.from("cms_settings").select("value").eq("key", "journal_intro_draft").maybeSingle(),
    ]);
    return respond.ok({
      published: pub ? parseJournalIntro(pub.value) : null,
      draft: draft ? parseJournalIntro(draft.value) : null,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError("Failed to load journal intro", error instanceof Error ? error.message : String(error));
  }
}
