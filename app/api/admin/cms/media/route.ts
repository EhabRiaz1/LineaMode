import { z } from "zod";
import { respond } from "@/lib/api/responses";
import { revalidateTag } from "next/cache";
import { cmsTags } from "@/lib/cms/cache-tags";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { CMS_MEDIA_BUCKET, CMS_MEDIA_MAX_BYTES, CMS_MEDIA_MAX_MB } from "@/lib/cms/media-config";

const BUCKET = CMS_MEDIA_BUCKET;

function publicUrl(supabase: ReturnType<typeof getServiceRoleClient>, path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_media")
      .select("id, alt, width, height, storage_path, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return respond.serverError("Failed to load media", error.message);
    const items = (data ?? []).map((row) => ({
      ...row,
      url: publicUrl(supabase, row.storage_path),
    }));
    return respond.ok({ media: items });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load media",
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * Commit step of the direct-upload flow. The browser has already streamed the
 * file straight to Supabase Storage via a signed upload URL (see
 * `./sign/route.ts`), so this endpoint receives only metadata — never bytes.
 * That keeps the request body tiny and immune to the platform's 4.5 MB limit.
 *
 * We verify the object actually landed in storage, re-check its real size
 * server-side, then insert the DB row. Any failure rolls back the uploaded
 * object so we never leave an orphaned file.
 */
const commitSchema = z.object({
  path: z.string().min(1).max(300),
  alt: z.string().max(240).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

function splitStoragePath(path: string): { folder: string; name: string } {
  const slash = path.lastIndexOf("/");
  if (slash < 0) return { folder: "", name: path };
  return { folder: path.slice(0, slash), name: path.slice(slash + 1) };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const json = await request.json().catch(() => null);
    const parsed = commitSchema.safeParse(json);
    if (!parsed.success) {
      return respond.badRequest("Invalid upload payload", parsed.error.flatten());
    }

    const { path } = parsed.data;
    const supabase = getServiceRoleClient();
    const { folder, name } = splitStoragePath(path);

    // Confirm the direct upload completed and read the authoritative size
    // from storage — never trust a client-reported size.
    const { data: listed, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(folder, { search: name, limit: 100 });
    if (listError) {
      return respond.serverError("Could not verify upload", listError.message);
    }
    const object = listed?.find((entry) => entry.name === name);
    if (!object) {
      return respond.badRequest("Upload not found in storage — please retry");
    }

    const size = (object.metadata as { size?: number } | null)?.size ?? 0;
    if (size <= 0 || size > CMS_MEDIA_MAX_BYTES) {
      await supabase.storage.from(BUCKET).remove([path]);
      return respond.badRequest(`Image too large (${CMS_MEDIA_MAX_MB} MB limit)`);
    }

    const { data: row, error: insertError } = await supabase
      .from("cms_media")
      .insert({
        storage_path: path,
        alt: parsed.data.alt ?? null,
        width: parsed.data.width ?? null,
        height: parsed.data.height ?? null,
        uploaded_by: admin.id,
      })
      .select("id, alt, width, height, storage_path, created_at")
      .single();
    if (insertError || !row) {
      await supabase.storage.from(BUCKET).remove([path]);
      return respond.serverError("Upload saved but DB insert failed", insertError?.message);
    }

    revalidateTag(cmsTags.media(), "max");
    return respond.created({
      media: { ...row, url: publicUrl(supabase, row.storage_path) },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to upload media",
      error instanceof Error ? error.message : String(error),
    );
  }
}
