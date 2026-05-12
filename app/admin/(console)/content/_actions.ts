"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { blocks as blocksSchema, seoSchema } from "@/lib/cms/blocks";
import { cmsTags } from "@/lib/cms/cache-tags";
import {
  getServiceRoleClient,
  requireAdminUser,
  UnauthorizedError,
} from "@/lib/supabase/client";

/**
 * Server actions for /admin/content. All mutations follow the same shape:
 *
 *   1. Authenticate via the user's bearer token (passed from the client
 *      session). Returning a typed { ok, error } makes optimistic UI easy.
 *   2. Validate the payload with Zod so we never write malformed jsonb.
 *   3. Mutate Supabase with the service-role client.
 *   4. Invalidate the matching cache tag with profile 'max' so customer
 *      pages serve stale-while-revalidate without ever rebuilding.
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function authenticate(token: string | null): Promise<{ id: string } | { error: string }> {
  if (!token) return { error: "Missing auth token" };
  try {
    const admin = await requireAdminUser(`Bearer ${token}`);
    return { id: admin.id };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: err.message };
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }
}

const savePageSchema = z.object({
  slug: z.string().min(1).max(80),
  blocks: blocksSchema,
  seo: seoSchema.optional(),
  title: z.string().min(1).max(160).optional(),
});

export async function savePageDraft(
  token: string | null,
  payload: unknown,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = savePageSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = getServiceRoleClient();
  const update: Record<string, unknown> = {
    draft_blocks: parsed.data.blocks,
    draft_seo: parsed.data.seo ?? null,
    updated_by: auth.id,
  };
  if (parsed.data.title) update.title = parsed.data.title;

  const { error } = await supabase
    .from("cms_pages")
    .update(update)
    .eq("slug", parsed.data.slug);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function publishPage(
  token: string | null,
  slug: string,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = getServiceRoleClient();
  const { data: row, error: readError } = await supabase
    .from("cms_pages")
    .select("blocks, draft_blocks, seo, draft_seo, version")
    .eq("slug", slug)
    .single();
  if (readError || !row) return { ok: false, error: readError?.message ?? "Page not found" };

  const nextBlocks = row.draft_blocks ?? row.blocks ?? [];
  const nextSeo = row.draft_seo ?? row.seo ?? {};
  const nextVersion = (row.version ?? 1) + 1;

  await supabase.from("cms_pages_revisions").insert({
    slug,
    blocks: nextBlocks,
    seo: nextSeo,
    version: nextVersion,
    updated_by: auth.id,
  });

  const { error: updateError } = await supabase
    .from("cms_pages")
    .update({
      blocks: nextBlocks,
      seo: nextSeo,
      draft_blocks: null,
      draft_seo: null,
      version: nextVersion,
      status: "published",
      published_at: new Date().toISOString(),
      updated_by: auth.id,
    })
    .eq("slug", slug);

  if (updateError) return { ok: false, error: updateError.message };

  revalidateTag(cmsTags.page(slug), "max");
  revalidateTag(cmsTags.pagesIndex(), "max");
  return { ok: true, data: undefined };
}

export async function discardPageDraft(
  token: string | null,
  slug: string,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("cms_pages")
    .update({ draft_blocks: null, draft_seo: null, updated_by: auth.id })
    .eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

const journalSchema = z.object({
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  body_mdx: z.string().max(50000).optional(),
  category: z.string().max(80).optional(),
  read_time: z.string().max(40).optional(),
  cover_media_id: z.string().uuid().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export async function saveJournalEntry(
  token: string | null,
  payload: unknown,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = journalSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("cms_journal")
    .upsert(
      {
        ...parsed.data,
        published_at:
          parsed.data.status === "published" ? new Date().toISOString() : null,
        updated_by: auth.id,
      },
      { onConflict: "slug" },
    );
  if (error) return { ok: false, error: error.message };

  revalidateTag(cmsTags.journalEntry(parsed.data.slug), "max");
  revalidateTag(cmsTags.journalIndex(), "max");
  return { ok: true, data: undefined };
}

const settingSchema = z.object({
  key: z.string().min(1).max(80),
  value: z.unknown(),
});

export async function saveSetting(
  token: string | null,
  payload: unknown,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = settingSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("cms_settings")
    .upsert(
      { key: parsed.data.key, value: parsed.data.value, updated_by: auth.id },
      { onConflict: "key" },
    );
  if (error) return { ok: false, error: error.message };

  revalidateTag(cmsTags.setting(parsed.data.key), "max");
  revalidateTag(cmsTags.settingsIndex(), "max");
  return { ok: true, data: undefined };
}
