"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { blocks as blocksSchema, seoSchema } from "@/lib/cms/blocks";
import { cmsTags } from "@/lib/cms/cache-tags";
import { homeContentSchema, backfillHomeProductCategoryImages, type HomeContent } from "@/lib/cms/home-schema";
import { capabilitiesContentSchema } from "@/lib/cms/capabilities-schema";
import { contactContentSchema } from "@/lib/cms/contact-schema";
import { foundersContentSchema } from "@/lib/cms/founders-schema";
import {
  productsContentSchema,
  parseProductsContent,
  getLegacyHomeCategoryImages,
} from "@/lib/cms/products-schema";
import { journalIntroSchema } from "@/lib/cms/journal-intro-schema";
import { aboutContentSchema } from "@/lib/cms/about-schema";
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

async function enrichHomeContentWithLegacyProductImages(
  content: HomeContent,
  supabase: ReturnType<typeof getServiceRoleClient>,
): Promise<HomeContent> {
  const [{ data: productsDraft }, { data: productsPub }] = await Promise.all([
    supabase.from("cms_settings").select("value").eq("key", "products_content_draft").maybeSingle(),
    supabase.from("cms_settings").select("value").eq("key", "products_content").maybeSingle(),
  ]);
  const products = parseProductsContent(productsDraft?.value ?? productsPub?.value ?? {});
  const legacyImages = getLegacyHomeCategoryImages(products);
  return {
    ...content,
    products: {
      ...content.products,
      categories: backfillHomeProductCategoryImages(content.products.categories, legacyImages),
    },
  };
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

export async function saveHomeContentDraft(
  token: string | null,
  content: unknown,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = homeContentSchema.safeParse(content);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = getServiceRoleClient();
  const enriched = await enrichHomeContentWithLegacyProductImages(parsed.data, supabase);
  const { error } = await supabase.from("cms_settings").upsert(
    { key: "home_content_draft", value: enriched, updated_by: auth.id },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function publishHomeContent(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = getServiceRoleClient();

  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    supabase.from("cms_settings").select("value").eq("key", "home_content_draft").maybeSingle(),
    supabase.from("cms_settings").select("value").eq("key", "home_content").maybeSingle(),
  ]);

  const contentToPublish = draftRow?.value ?? pubRow?.value ?? {};
  const parsed = homeContentSchema.safeParse(contentToPublish);
  const base = parsed.success ? parsed.data : (contentToPublish as HomeContent);
  const enriched = await enrichHomeContentWithLegacyProductImages(base, supabase);

  const { error: pubError } = await supabase.from("cms_settings").upsert(
    { key: "home_content", value: enriched, updated_by: auth.id },
    { onConflict: "key" },
  );
  if (pubError) return { ok: false, error: pubError.message };

  await supabase.from("cms_settings").delete().eq("key", "home_content_draft");

  revalidateTag(cmsTags.homeContent(), "max");
  return { ok: true, data: undefined };
}

export async function discardHomeContentDraft(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = getServiceRoleClient();
  await supabase.from("cms_settings").delete().eq("key", "home_content_draft");
  return { ok: true, data: undefined };
}

export async function saveCapabilitiesContentDraft(
  token: string | null,
  content: unknown,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = capabilitiesContentSchema.safeParse(content);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("cms_settings").upsert(
    { key: "capabilities_content_draft", value: parsed.data, updated_by: auth.id },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function publishCapabilitiesContent(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    supabase
      .from("cms_settings")
      .select("value")
      .eq("key", "capabilities_content_draft")
      .maybeSingle(),
    supabase
      .from("cms_settings")
      .select("value")
      .eq("key", "capabilities_content")
      .maybeSingle(),
  ]);

  const contentToPublish = draftRow?.value ?? pubRow?.value ?? {};

  const { error: pubError } = await supabase.from("cms_settings").upsert(
    { key: "capabilities_content", value: contentToPublish, updated_by: auth.id },
    { onConflict: "key" },
  );
  if (pubError) return { ok: false, error: pubError.message };

  await supabase.from("cms_settings").delete().eq("key", "capabilities_content_draft");

  revalidateTag(cmsTags.capabilitiesContent(), "max");
  return { ok: true, data: undefined };
}

export async function discardCapabilitiesContentDraft(
  token: string | null,
): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = getServiceRoleClient();
  await supabase.from("cms_settings").delete().eq("key", "capabilities_content_draft");
  return { ok: true, data: undefined };
}

// ─── Generic helper for the save/publish/discard pattern ────────────────────

async function saveContentDraft(
  auth: { id: string },
  key: string,
  value: unknown,
  supabase: ReturnType<typeof getServiceRoleClient>,
) {
  const { error } = await supabase
    .from("cms_settings")
    .upsert({ key: `${key}_draft`, value, updated_by: auth.id }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message } as const;
  return { ok: true, data: undefined } as const;
}

async function publishContent(
  auth: { id: string },
  key: string,
  supabase: ReturnType<typeof getServiceRoleClient>,
  cacheTagKey: string,
) {
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    supabase.from("cms_settings").select("value").eq("key", `${key}_draft`).maybeSingle(),
    supabase.from("cms_settings").select("value").eq("key", key).maybeSingle(),
  ]);
  const content = draftRow?.value ?? pubRow?.value ?? {};
  const { error } = await supabase
    .from("cms_settings")
    .upsert({ key, value: content, updated_by: auth.id }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message } as const;
  await supabase.from("cms_settings").delete().eq("key", `${key}_draft`);
  revalidateTag(cacheTagKey, "max");
  return { ok: true, data: undefined } as const;
}

async function discardContentDraft(
  auth: { id: string },
  key: string,
  supabase: ReturnType<typeof getServiceRoleClient>,
) {
  await supabase.from("cms_settings").delete().eq("key", `${key}_draft`);
  return { ok: true, data: undefined } as const;
}

// ─── Contact ────────────────────────────────────────────────────────────────

export async function saveContactContentDraft(token: string | null, content: unknown): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = contactContentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  return saveContentDraft(auth, "contact_content", parsed.data, getServiceRoleClient());
}
export async function publishContactContent(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return publishContent(auth, "contact_content", getServiceRoleClient(), cmsTags.contactContent());
}
export async function discardContactContentDraft(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return discardContentDraft(auth, "contact_content", getServiceRoleClient());
}

// ─── Founders ───────────────────────────────────────────────────────────────

export async function saveFoundersContentDraft(token: string | null, content: unknown): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = foundersContentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  return saveContentDraft(auth, "founders_content", parsed.data, getServiceRoleClient());
}
export async function publishFoundersContent(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return publishContent(auth, "founders_content", getServiceRoleClient(), cmsTags.foundersContent());
}
export async function discardFoundersContentDraft(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return discardContentDraft(auth, "founders_content", getServiceRoleClient());
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function saveProductsContentDraft(token: string | null, content: unknown): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = productsContentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  return saveContentDraft(auth, "products_content", parsed.data, getServiceRoleClient());
}
export async function publishProductsContent(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return publishContent(auth, "products_content", getServiceRoleClient(), cmsTags.productsContent());
}
export async function discardProductsContentDraft(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return discardContentDraft(auth, "products_content", getServiceRoleClient());
}

// ─── About ───────────────────────────────────────────────────────────────────

export async function saveAboutContentDraft(token: string | null, content: unknown): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = aboutContentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  return saveContentDraft(auth, "about_content", parsed.data, getServiceRoleClient());
}
export async function publishAboutContent(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return publishContent(auth, "about_content", getServiceRoleClient(), cmsTags.aboutContent());
}
export async function discardAboutContentDraft(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return discardContentDraft(auth, "about_content", getServiceRoleClient());
}

// ─── Journal cache refresh ───────────────────────────────────────────────────

export async function revalidateJournalCache(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  revalidateTag(cmsTags.journalIndex(), "max");
  return { ok: true, data: undefined };
}

// ─── Journal intro ───────────────────────────────────────────────────────────

export async function saveJournalIntro(token: string | null, content: unknown): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = journalIntroSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  return saveContentDraft(auth, "journal_intro", parsed.data, getServiceRoleClient());
}
export async function publishJournalIntro(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return publishContent(auth, "journal_intro", getServiceRoleClient(), cmsTags.journalIntro());
}
export async function discardJournalIntroDraft(token: string | null): Promise<ActionResult> {
  const auth = await authenticate(token);
  if ("error" in auth) return { ok: false, error: auth.error };
  return discardContentDraft(auth, "journal_intro", getServiceRoleClient());
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
