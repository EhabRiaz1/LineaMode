/**
 * Content adapter.
 *
 * The site reads all dynamic content (currently: journal entries) through
 * this single module. The default backend is `local` — a file-based provider
 * that reads typed modules under `content/`. A `sanity` provider is stubbed
 * out so that the day a real CMS is wired up, the only file that needs to
 * change is `lib/cms/index.ts` (this file) — every page stays untouched.
 */

import * as local from "./local";

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

export type CmsProvider = {
  listJournal(): Promise<JournalSummary[]>;
  getJournalEntry(slug: string): Promise<JournalEntry | null>;
};

type ProviderKey = "local" | "sanity";
const PROVIDER: ProviderKey = "local";

const providers: Record<ProviderKey, CmsProvider> = {
  local,
  // Sanity provider stub — replace with a real implementation when the CMS
  // is provisioned. For now it falls through to the local file-based store
  // so flipping `PROVIDER` doesn't crash.
  sanity: local,
};

export const cms: CmsProvider = providers[PROVIDER];
export const listJournal = () => cms.listJournal();
export const getJournalEntry = (slug: string) => cms.getJournalEntry(slug);
