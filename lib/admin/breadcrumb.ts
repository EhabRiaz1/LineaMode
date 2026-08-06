/**
 * Breadcrumb labels for the admin topbar.
 *
 * Kept out of the Topbar component so the labelling rules are testable on
 * their own — the component only renders what this returns.
 */

/**
 * Segments whose display name isn't just their slug title-cased: acronyms,
 * renames, and anything with wording we want to control.
 */
const SECTION_TITLES: Record<string, string> = {
  inbox: "Inbox",
  projects: "Projects",
  pipeline: "Pipeline",
  pipelines: "Pipelines",
  clients: "Clients",
  content: "Content",
  pages: "Pages",
  journal: "Journal",
  "journal-intro": "Journal Intro",
  media: "Media",
  settings: "Settings",
  dashboard: "Dashboard",
  admins: "Admins",
  security: "Security",
  visibility: "Page Visibility",
  email: "Email",
  seo: "SEO",
  cms: "CMS",
  new: "New Entry",
};

/** Opaque identifiers (uuids, numeric ids) read worse title-cased than left alone. */
function looksLikeId(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(segment) || /^\d+$/.test(segment);
}

export function titleCaseSegment(segment: string): string {
  if (looksLikeId(segment)) return segment;
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

export function labelForSegment(segment: string): string {
  return SECTION_TITLES[segment] ?? titleCaseSegment(segment);
}

/**
 * Builds the topbar breadcrumb from a pathname. The leading "admin" segment is
 * dropped — the console is already the context.
 */
export function buildBreadcrumb(pathname: string | null): string {
  if (!pathname) return "Console";
  const segments = pathname.split("/").filter(Boolean).slice(1);
  if (segments.length === 0) return "Overview";
  return segments.map(labelForSegment).join(" · ");
}
