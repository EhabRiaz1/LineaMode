import { z } from "zod";

export const journalIntroSchema = z.object({
  eyebrow: z.string().max(80).default("Journal"),
  headlineLine1: z.string().max(120).default("Notes from"),
  headlineLine2: z.string().max(120).default("the studio."),
});

export type JournalIntroContent = z.infer<typeof journalIntroSchema>;

export const JOURNAL_INTRO_DEFAULTS: JournalIntroContent = {
  eyebrow: "Journal",
  headlineLine1: "Notes from",
  headlineLine2: "the studio.",
};

export function parseJournalIntro(raw: unknown): JournalIntroContent {
  const result = journalIntroSchema.safeParse(raw);
  if (result.success) return result.data;
  if (raw && typeof raw === "object") {
    return { ...JOURNAL_INTRO_DEFAULTS, ...((raw as object) ?? {}) };
  }
  return JOURNAL_INTRO_DEFAULTS;
}
