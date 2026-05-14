import type { JournalEntry } from "@/lib/cms";

/**
 * Journal entries are now managed entirely in Supabase (cms_journal table)
 * via the admin at /admin/content/pages/journal.
 *
 * This file is kept as an empty export so existing imports don't break
 * (e.g. the migrate route references it). The CMS layer no longer falls
 * back to this array when DB entries exist.
 */
export const journalEntries: JournalEntry[] = [];
