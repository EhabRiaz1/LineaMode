import JSZip from "jszip";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

const BUCKET = "intake-uploads";

type Params = Promise<{ id: string }>;

function zipFileName(name: string, index: number) {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").replace(/^_+/, "") || `file-${index + 1}`;
  return `${String(index + 1).padStart(2, "0")}-${cleaned}`;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { id } = await params;
    const supabase = getServiceRoleClient();

    const { data: attachments, error } = await supabase
      .from("attachments")
      .select("file_name, storage_path")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return respond.serverError("Unable to load attachments", error.message);
    }

    if (!attachments?.length) {
      return respond.notFound("No attachments found");
    }

    const zip = new JSZip();
    for (const [index, attachment] of attachments.entries()) {
      const downloaded = await supabase.storage.from(BUCKET).download(attachment.storage_path);
      if (downloaded.error || !downloaded.data) {
        return respond.serverError(`Unable to download ${attachment.file_name}`, downloaded.error?.message);
      }
      zip.file(zipFileName(attachment.file_name, index), Buffer.from(await downloaded.data.arrayBuffer()));
    }

    const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    const body = archive.buffer.slice(
      archive.byteOffset,
      archive.byteOffset + archive.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="lineamode-project-${id}-files.zip"`,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to prepare ZIP",
      error instanceof Error ? error.message : String(error),
    );
  }
}
