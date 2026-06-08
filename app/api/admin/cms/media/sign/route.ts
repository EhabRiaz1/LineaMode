import { z } from "zod";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import {
  CMS_MEDIA_BUCKET,
  CMS_MEDIA_MAX_BYTES,
  CMS_MEDIA_MAX_MB,
  isAllowedMediaType,
  mediaExtension,
} from "@/lib/cms/media-config";

/**
 * Mints a single-use signed upload URL so the browser can stream the file
 * bytes *directly* to Supabase Storage, bypassing the Vercel function (and
 * its 4.5 MB request-body limit that previously caused 413 errors).
 *
 * The function only ever exchanges tiny JSON payloads, so it can never hit
 * the platform body limit regardless of file size.
 */
const signSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  size: z
    .number()
    .int()
    .positive()
    .max(CMS_MEDIA_MAX_BYTES, `File too large (${CMS_MEDIA_MAX_MB} MB limit)`),
});

export async function POST(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);

    const json = await request.json().catch(() => null);
    const parsed = signSchema.safeParse(json);
    if (!parsed.success) {
      return respond.badRequest("Invalid upload request", parsed.error.flatten());
    }
    if (!isAllowedMediaType(parsed.data.contentType)) {
      return respond.badRequest(`Unsupported file type: ${parsed.data.contentType}`);
    }

    const ext = mediaExtension(parsed.data.filename, parsed.data.contentType);
    const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase.storage
      .from(CMS_MEDIA_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) {
      return respond.serverError("Could not create upload URL", error?.message);
    }

    return respond.ok({ path: data.path, token: data.token });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to prepare upload",
      error instanceof Error ? error.message : String(error),
    );
  }
}
