/**
 * Shared configuration for the CMS media library, imported by both the
 * browser uploader and the server route handlers so the limits never drift.
 *
 * The byte ceiling mirrors the `cms-media` bucket's `file_size_limit`
 * (26214400 bytes) set in `supabase/migrations/0006_storage_buckets.sql`.
 * Supabase enforces it server-side; we mirror it here for fast feedback.
 */
export const CMS_MEDIA_BUCKET = "cms-media";

export const CMS_MEDIA_MAX_BYTES = 25 * 1024 * 1024;

export const CMS_MEDIA_MAX_MB = Math.round(CMS_MEDIA_MAX_BYTES / (1024 * 1024));

export const CMS_MEDIA_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
] as const;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export function isAllowedMediaType(type: string): boolean {
  return (CMS_MEDIA_ALLOWED_TYPES as readonly string[]).includes(type);
}

/** Derive a safe, lowercase extension from the filename, falling back to mime. */
export function mediaExtension(filename: string, contentType: string): string {
  const fromName = filename.includes(".") ? filename.split(".").pop()!.toLowerCase() : "";
  if (/^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  return EXT_BY_TYPE[contentType] ?? "bin";
}
