import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

const BUCKET = "intake-uploads";

type Params = Promise<{ id: string; attachmentId: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { id, attachmentId } = await params;
    const supabase = getServiceRoleClient();

    const { data: attachment, error } = await supabase
      .from("attachments")
      .select("id, file_name, storage_path")
      .eq("id", attachmentId)
      .eq("project_id", id)
      .single();

    if (error || !attachment) {
      return respond.notFound("Attachment not found");
    }

    const signed = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(attachment.storage_path, 60, {
        download: attachment.file_name,
      });

    if (signed.error || !signed.data?.signedUrl) {
      return respond.serverError("Unable to create download link", signed.error?.message);
    }

    return respond.ok({ url: signed.data.signedUrl });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to prepare download",
      error instanceof Error ? error.message : String(error),
    );
  }
}
