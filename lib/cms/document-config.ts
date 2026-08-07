/**
 * Shared configuration for admin-uploaded documents (the products lookbook
 * PDF today), imported by both the browser uploader and the route handler so
 * the limits never drift.
 *
 * The byte ceiling mirrors the `cms-documents` bucket's `file_size_limit`
 * (52428800 bytes) set in `supabase/migrations/0017_document_storage.sql`.
 * Supabase enforces it server-side; we mirror it here for fast feedback
 * before a large file is uploaded.
 */

export const CMS_DOCUMENTS_BUCKET = "cms-documents";

export const CMS_DOCUMENTS_MAX_BYTES = 50 * 1024 * 1024;

export const CMS_DOCUMENTS_MAX_MB = Math.round(
  CMS_DOCUMENTS_MAX_BYTES / (1024 * 1024),
);

export const CMS_DOCUMENTS_ALLOWED_TYPES = ["application/pdf"] as const;

export function isAllowedDocumentType(type: string): boolean {
  return (CMS_DOCUMENTS_ALLOWED_TYPES as readonly string[]).includes(type);
}

/**
 * A filesystem-safe slug for the original filename, so an uploaded
 * `SS26 Lookbook (final).pdf` stays recognisable in Storage instead of
 * becoming an opaque uuid. The uuid prefix keeps collisions impossible.
 */
export function documentObjectName(filename: string): string {
  const base = filename.replace(/\.pdf$/i, "");
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "document";
  return `${slug}.pdf`;
}
