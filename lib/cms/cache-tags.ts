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
  homeContent: () => "cms:home-content",
  capabilitiesContent: () => "cms:capabilities-content",
  contactContent: () => "cms:contact-content",
  foundersContent: () => "cms:founders-content",
  productsContent: () => "cms:products-content",
  journalIntro: () => "cms:journal-intro",
  aboutContent: () => "cms:about-content",
  media: () => "cms:media",
};
