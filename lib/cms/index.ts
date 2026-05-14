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
import { HOME_CONTENT_DEFAULTS, type HomeContent } from "./home-schema";
import {
  CAPABILITIES_CONTENT_DEFAULTS,
  type CapabilitiesContent,
} from "./capabilities-schema";
export type { CapabilitiesContent };
import { CONTACT_CONTENT_DEFAULTS, type ContactContent } from "./contact-schema";
import { FOUNDERS_CONTENT_DEFAULTS, type FoundersContent } from "./founders-schema";
import { PRODUCTS_CONTENT_DEFAULTS, type ProductsContent } from "./products-schema";
import { JOURNAL_INTRO_DEFAULTS, type JournalIntroContent } from "./journal-intro-schema";
import { ABOUT_CONTENT_DEFAULTS, type AboutContent } from "./about-schema";

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
  getHomeContent(): Promise<HomeContent>;
  getCapabilitiesContent(): Promise<CapabilitiesContent>;
  getContactContent(): Promise<ContactContent>;
  getFoundersContent(): Promise<FoundersContent>;
  getProductsContent(): Promise<ProductsContent>;
  getJournalIntro(): Promise<JournalIntroContent>;
  getAboutContent(): Promise<AboutContent>;
};

const localProvider: CmsProvider = {
  listJournal: local.listJournal,
  getJournalEntry: local.getJournalEntry,
  getPage: async () => null,
  getSetting: async () => null,
  getHomeContent: async () => HOME_CONTENT_DEFAULTS,
  getCapabilitiesContent: async () => CAPABILITIES_CONTENT_DEFAULTS,
  getContactContent: async () => CONTACT_CONTENT_DEFAULTS,
  getFoundersContent: async () => FOUNDERS_CONTENT_DEFAULTS,
  getProductsContent: async () => PRODUCTS_CONTENT_DEFAULTS,
  getJournalIntro: async () => JOURNAL_INTRO_DEFAULTS,
  getAboutContent: async () => ABOUT_CONTENT_DEFAULTS,
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
      getHomeContent: supabase.getHomeContent,
      getCapabilitiesContent: supabase.getCapabilitiesContent,
      getContactContent: supabase.getContactContent,
      getFoundersContent: supabase.getFoundersContent,
      getProductsContent: supabase.getProductsContent,
      getJournalIntro: supabase.getJournalIntro,
      getAboutContent: supabase.getAboutContent,
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

export const getContactContent = async (): Promise<ContactContent> => {
  "use cache";
  cacheTag(cmsTags.contactContent());
  const provider = await resolveProvider();
  return provider.getContactContent();
};

export const getFoundersContent = async (): Promise<FoundersContent> => {
  "use cache";
  cacheTag(cmsTags.foundersContent());
  const provider = await resolveProvider();
  return provider.getFoundersContent();
};

export const getProductsContent = async (): Promise<ProductsContent> => {
  "use cache";
  cacheTag(cmsTags.productsContent());
  const provider = await resolveProvider();
  return provider.getProductsContent();
};

export const getAboutContent = async (): Promise<AboutContent> => {
  "use cache";
  cacheTag(cmsTags.aboutContent());
  const provider = await resolveProvider();
  return provider.getAboutContent();
};

export const getJournalIntro = async (): Promise<JournalIntroContent> => {
  "use cache";
  cacheTag(cmsTags.journalIntro());
  const provider = await resolveProvider();
  return provider.getJournalIntro();
};

export const getCapabilitiesContent = async (): Promise<CapabilitiesContent> => {
  "use cache";
  cacheTag(cmsTags.capabilitiesContent());
  const provider = await resolveProvider();
  return provider.getCapabilitiesContent();
};

export const getHomeContent = async (): Promise<HomeContent> => {
  "use cache";
  cacheTag(cmsTags.homeContent());
  const provider = await resolveProvider();
  return provider.getHomeContent();
};

export const getPageVisibility = async (): Promise<PageVisibility> => {
  "use cache";
  cacheTag(cmsTags.setting("page_visibility"));
  const visibility = await getSetting<PageVisibility>("page_visibility");
  return visibility ?? DEFAULT_VISIBILITY;
};
