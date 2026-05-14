import { respond } from "@/lib/api/responses";
import { getServiceRoleClient } from "@/lib/supabase/client";

const BUCKET = "intake-uploads";
const MAX_FILES = 8;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").replace(/^_+/, "").slice(0, 180) || "upload.bin";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return respond.badRequest("No files provided");
    }

    if (files.length > MAX_FILES) {
      return respond.badRequest(`Upload up to ${MAX_FILES} files`);
    }

    const supabase = getServiceRoleClient();
    const uploadGroup = crypto.randomUUID();
    const uploaded = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return respond.badRequest(`${file.name} is larger than 50 MB`);
      }

      const filename = safeFileName(file.name);
      const path = `pending/${uploadGroup}/${crypto.randomUUID()}-${filename}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      if (error) {
        return respond.serverError("File upload failed", error.message);
      }

      uploaded.push({
        name: file.name,
        type: file.type || undefined,
        size: file.size,
        path,
      });
    }

    return respond.created({ files: uploaded });
  } catch (error) {
    return respond.serverError(
      "Failed to upload files",
      error instanceof Error ? error.message : String(error),
    );
  }
}
