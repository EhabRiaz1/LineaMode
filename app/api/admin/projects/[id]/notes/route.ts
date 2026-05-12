import { z } from "zod";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

type Params = Promise<{ id: string }>;

const noteSchema = z.object({
  body: z.string().min(1).max(8000),
});

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { id } = await params;
    const json = await request.json();
    const parsed = noteSchema.safeParse(json);
    if (!parsed.success) {
      return respond.badRequest("Invalid note payload", parsed.error.flatten());
    }

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("project_notes")
      .insert({
        project_id: id,
        author_id: admin.id,
        body: parsed.data.body,
      })
      .select("*")
      .single();

    if (error) {
      return respond.serverError("Unable to add note", error.message);
    }
    return respond.created({ note: data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to add note",
      error instanceof Error ? error.message : String(error),
    );
  }
}
