import "server-only";
import { cacheTag } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/client";
import type { Page, Blocks, Seo } from "@/lib/cms/blocks";
import { blocks as blocksSchema, seoSchema } from "@/lib/cms/blocks";
import { cmsTags } from "@/lib/cms/cache-tags";
import type { JournalEntry, JournalSummary } from "@/lib/cms";

/**
 * Supabase-native CMS provider.
 *
 * Reads go through `'use cache' + cacheTag()` so the customer site is
 * always served from cache, and admin server actions invalidate by tag
 * (`revalidateTag(cmsTags.page(slug), 'max')`) for stale-while-revalidate.
 */

type DbPageRow = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  blocks: unknown;
  seo: unknown;
  version: number;
  updated_at: string;
};

function safeBlocks(value: unknown): Blocks {
  const parsed = blocksSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function safeSeo(value: unknown): Seo {
  const parsed = seoSchema.safeParse(value);
  return parsed.success ? parsed.data : {};
}

function rowToPublishedPage(row: DbPageRow): Page {
  return {
    slug: row.slug,
    title: row.title,
    status: row.status,
    blocks: safeBlocks(row.blocks),
    seo: safeSeo(row.seo),
  };
}

async function fetchPagePublished(slug: string): Promise<Page | null> {
  "use cache";
  cacheTag(cmsTags.page(slug));
  const sb = getServiceRoleClient();
  const { data, error } = await sb
    .from("cms_pages")
    .select("slug, title, status, blocks, seo, version, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return rowToPublishedPage(data as DbPageRow);
}

export async function getPage(slug: string): Promise<Page | null> {
  return fetchPagePublished(slug);
}

async function fetchJournalIndex(): Promise<JournalSummary[]> {
  "use cache";
  cacheTag(cmsTags.journalIndex());
  const sb = getServiceRoleClient();
  const { data, error } = await sb
    .from("cms_journal")
    .select(
      "slug, title, excerpt, category, published_at, cover_media_id, cms_media:cover_media_id (storage_path)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(40);
  if (error || !data) return [];
  return data.map((row) => {
    const media = (row as unknown as { cms_media: { storage_path: string } | null }).cms_media;
    return {
      slug: row.slug as string,
      title: row.title as string,
      excerpt: (row.excerpt as string) ?? "",
      date: (row.published_at as string) ?? new Date().toISOString(),
      category: (row.category as string) ?? "Studio",
      cover: media?.storage_path ?? "",
    } satisfies JournalSummary;
  });
}

async function fetchJournalEntry(slug: string): Promise<JournalEntry | null> {
  "use cache";
  cacheTag(cmsTags.journalEntry(slug));
  const sb = getServiceRoleClient();
  const { data, error } = await sb
    .from("cms_journal")
    .select(
      "slug, title, excerpt, body_mdx, category, read_time, published_at, cms_media:cover_media_id (storage_path)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  const media = (data as unknown as { cms_media: { storage_path: string } | null }).cms_media;
  return {
    slug: data.slug as string,
    title: data.title as string,
    excerpt: (data.excerpt as string) ?? "",
    body: (data.body_mdx as string) ?? "",
    readTime: (data.read_time as string) ?? "3 min",
    category: (data.category as string) ?? "Studio",
    date: (data.published_at as string) ?? new Date().toISOString(),
    cover: media?.storage_path ?? "",
  } satisfies JournalEntry;
}

export async function listJournal(): Promise<JournalSummary[]> {
  return fetchJournalIndex();
}

export async function getJournalEntry(slug: string): Promise<JournalEntry | null> {
  return fetchJournalEntry(slug);
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  "use cache";
  cacheTag(cmsTags.setting(key));
  const sb = getServiceRoleClient();
  const { data, error } = await sb
    .from("cms_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return null;
  return data.value as T;
}
