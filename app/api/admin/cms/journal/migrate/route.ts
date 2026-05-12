import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { revalidateTag } from "next/cache";
import { cmsTags } from "@/lib/cms/cache-tags";
import { journalEntries } from "@/content/journal";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();

    // Check if any entries already exist
    const { count, error: countError } = await supabase
      .from("cms_journal")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return respond.serverError("Unable to check existing entries", countError.message);
    }

    if ((count ?? 0) > 0) {
      return respond.badRequest("Journal entries already exist in the database. Migration skipped to prevent duplicates.");
    }

    // Migrate each fallback entry
    const entries = journalEntries.map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      category: entry.category,
      excerpt: entry.excerpt,
      cover_url: entry.cover,
      published_at: new Date().toISOString(),
      status: "published" as const,
      body_mdx: entry.body,
      read_time: entry.readTime,
      created_by: admin.id,
      updated_by: admin.id,
    }));

    const { error: insertError } = await supabase
      .from("cms_journal")
      .insert(entries);

    if (insertError) {
      return respond.serverError("Failed to migrate journal entries", insertError.message);
    }

    // Invalidate cache (Next 16: stale-while-revalidate via 'max').
    revalidateTag(cmsTags.journalIndex(), "max");

    return respond.ok({
      message: `Successfully migrated ${entries.length} journal entries`,
      count: entries.length,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to migrate journal entries",
      error instanceof Error ? error.message : String(error),
    );
  }
}
