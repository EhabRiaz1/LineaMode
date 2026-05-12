import { z } from "zod";
import { respond } from "@/lib/api/responses";
import { revalidateTag } from "next/cache";
import { cmsTags } from "@/lib/cms/cache-tags";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

const BUCKET = "cms-media";

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

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  alt: z.string().max(240).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** base64-encoded payload — only used for small uploads from the browser. */
  data: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const json = await request.json();
    const parsed = uploadSchema.safeParse(json);
    if (!parsed.success) {
      return respond.badRequest("Invalid upload payload", parsed.error.flatten());
    }

    const supabase = getServiceRoleClient();
    const buffer = Buffer.from(parsed.data.data, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      return respond.badRequest("Image too large (10 MB limit)");
    }
    const ext = parsed.data.filename.split(".").pop() ?? "bin";
    const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;

    const upload = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: parsed.data.contentType,
      upsert: false,
    });
    if (upload.error) {
      return respond.serverError("Upload failed", upload.error.message);
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
