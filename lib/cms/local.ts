import type { JournalEntry, JournalSummary } from "./index";
import { journalEntries } from "@/content/journal";

export async function listJournal(): Promise<JournalSummary[]> {
  // Strip body/readTime — index views only need summary fields.
  return journalEntries.map(
    ({ body: _body, readTime: _readTime, ...rest }) => rest,
  );
}

export async function getJournalEntry(slug: string): Promise<JournalEntry | null> {
  return journalEntries.find((e) => e.slug === slug) ?? null;
}
