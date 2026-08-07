import { z } from "zod";
import { respond } from "@/lib/api/responses";
import {
  getServiceRoleClient,
  requireAdminUser,
  UnauthorizedError,
} from "@/lib/supabase/client";
import {
  CMS_DOCUMENTS_BUCKET,
  CMS_DOCUMENTS_MAX_BYTES,
  CMS_DOCUMENTS_MAX_MB,
  documentObjectName,
  isAllowedDocumentType,
} from "@/lib/cms/document-config";

/**
 * Mints a single-use signed upload URL so the browser streams the PDF
 * *directly* to Supabase Storage.
 *
 * This matters more here than for images: a print-quality lookbook can be
 * tens of megabytes, and routing those bytes through the Vercel function
 * would hit its 4.5 MB request-body limit. This handler only ever exchanges
 * small JSON payloads, so file size is irrelevant to it.
 *
 * Returns the eventual public URL alongside the upload token so the client
 * doesn't have to reconstruct it.
 */
const signSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  size: z
    .number()
    .int()
    .positive()
    .max(CMS_DOCUMENTS_MAX_BYTES, `File too large (${CMS_DOCUMENTS_MAX_MB} MB limit)`),
});

export async function POST(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);

    const json = await request.json().catch(() => null);
    const parsed = signSchema.safeParse(json);
    if (!parsed.success) {
      return respond.badRequest("Invalid upload request", parsed.error.flatten());
    }
    if (!isAllowedDocumentType(parsed.data.contentType)) {
      return respond.badRequest(
        `Only PDF files are supported (received ${parsed.data.contentType}).`,
      );
    }

    // Date-partitioned so replacing a lookbook each season never overwrites
    // the previous one — old links keep working.
    const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}/${documentObjectName(
      parsed.data.filename,
    )}`;

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase.storage
      .from(CMS_DOCUMENTS_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return respond.serverError("Could not create upload URL", error?.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(CMS_DOCUMENTS_BUCKET).getPublicUrl(path);

    return respond.ok({ path: data.path, token: data.token, publicUrl });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to prepare upload",
      error instanceof Error ? error.message : String(error),
    );
  }
}
