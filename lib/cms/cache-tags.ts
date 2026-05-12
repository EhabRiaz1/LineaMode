/**
 * Single source-of-truth for the cache tags emitted by the Supabase CMS
 * provider. Keeping these in one file makes it obvious to future readers
 * which tags exist, and lets admin server actions invalidate by name
 * without typos.
 */

export const cmsTags = {
  page: (slug: string) => `cms:page:${slug}`,
  pagesIndex: () => "cms:pages",
  journalEntry: (slug: string) => `cms:journal:${slug}`,
  journalIndex: () => "cms:journal",
  setting: (key: string) => `cms:setting:${key}`,
  settingsIndex: () => "cms:settings",
  media: () => "cms:media",
};
