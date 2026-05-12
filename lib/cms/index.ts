/**
 * Content adapter.
 *
 * The site reads all dynamic content (currently: pages, journal, and
 * key/value settings) through this single module. The default backend is
 * `supabase` when the env vars are present, with a `local` provider as
 * fallback for first-run dev / CI / local previews.
 *
 * Every wrapper below is `'use cache'` + `cacheTag(...)` so customer
 * routes can statically prerender under Next 16 `cacheComponents`. Admin
 * server actions invalidate by tag (see lib/cms/cache-tags.ts).
 */

import { cacheTag } from "next/cache";
import * as local from "./local";
import { cmsTags } from "./cache-tags";
import type { Page } from "./blocks";

export type JournalSummary = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  cover: string;
};

export type JournalEntry = JournalSummary & {
  body: string;
  readTime: string;
};

export type PageVisibility = {
  [key: string]: {
    navbar: boolean;
    homepage: boolean;
  };
};

export type CmsProvider = {
  listJournal(): Promise<JournalSummary[]>;
  getJournalEntry(slug: string): Promise<JournalEntry | null>;
  getPage(slug: string): Promise<Page | null>;
  getSetting<T = unknown>(key: string): Promise<T | null>;
};

const localProvider: CmsProvider = {
  listJournal: local.listJournal,
  getJournalEntry: local.getJournalEntry,
  getPage: async () => null,
  getSetting: async () => null,
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let providerCache: CmsProvider | null = null;

async function resolveProvider(): Promise<CmsProvider> {
  if (providerCache) return providerCache;
  if (isSupabaseConfigured()) {
    const supabase = await import("./supabase");
    providerCache = {
      listJournal: supabase.listJournal,
      getJournalEntry: supabase.getJournalEntry,
      getPage: supabase.getPage,
      getSetting: supabase.getSetting,
    } satisfies CmsProvider;
  } else {
    providerCache = localProvider;
  }
  return providerCache;
}

export const listJournal = async (): Promise<JournalSummary[]> => {
  "use cache";
  cacheTag(cmsTags.journalIndex());
  const provider = await resolveProvider();
  const remote = await provider.listJournal();
  if (remote.length > 0) return remote;
  return local.listJournal();
};

export const getJournalEntry = async (slug: string): Promise<JournalEntry | null> => {
  "use cache";
  cacheTag(cmsTags.journalEntry(slug));
  const provider = await resolveProvider();
  const remote = await provider.getJournalEntry(slug);
  if (remote) return remote;
  return local.getJournalEntry(slug);
};

export const getPage = async (slug: string): Promise<Page | null> => {
  "use cache";
  cacheTag(cmsTags.page(slug));
  const provider = await resolveProvider();
  return provider.getPage(slug);
};

export const getSetting = async <T = unknown>(key: string): Promise<T | null> => {
  "use cache";
  cacheTag(cmsTags.setting(key));
  const provider = await resolveProvider();
  return provider.getSetting<T>(key);
};

const DEFAULT_VISIBILITY: PageVisibility = {
  lookbook: { navbar: true, homepage: true },
  journal: { navbar: true, homepage: true },
};

export const getPageVisibility = async (): Promise<PageVisibility> => {
  "use cache";
  cacheTag(cmsTags.setting("page_visibility"));
  const visibility = await getSetting<PageVisibility>("page_visibility");
  return visibility ?? DEFAULT_VISIBILITY;
};
