import { z } from "zod";
import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { getResendClient, RESEND_FROM } from "@/lib/email/resend";

type Params = Promise<{ id: string }>;

const emailSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(20000),
});

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { id } = await params;
    const json = await request.json();
    const parsed = emailSchema.safeParse(json);
    if (!parsed.success) {
      return respond.badRequest("Invalid email payload", parsed.error.flatten());
    }

    const supabase = getServiceRoleClient();
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, customers:customer_id (email)")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return respond.notFound("Project not found");
    }

    const customer = (project as unknown as { customers: { email: string } | null }).customers;
    if (!customer?.email) {
      return respond.badRequest("Project has no associated email");
    }

    const { data: row, error: insertError } = await supabase
      .from("project_emails")
      .insert({
        project_id: id,
        author_id: admin.id,
        to_address: customer.email,
        subject: parsed.data.subject,
        body: parsed.data.body,
        status: "queued",
      })
      .select("*")
      .single();

    if (insertError || !row) {
      return respond.serverError("Unable to log email", insertError?.message);
    }

    const resend = getResendClient();
    if (!resend) {
      // Still record the row so the admin sees it; mark as failed-to-send so
      // the UI surfaces the missing-key state.
      await supabase
        .from("project_emails")
        .update({ status: "failed" })
        .eq("id", row.id);
      return respond.serverError(
        "Email queued, but RESEND_API_KEY is not configured. Add the env var to actually send.",
      );
    }

    try {
      const sent = await resend.emails.send({
        from: RESEND_FROM,
        to: customer.email,
        subject: parsed.data.subject,
        text: parsed.data.body,
      });
      const sendId = sent.data?.id ?? null;
      await supabase
        .from("project_emails")
        .update({
          status: sent.error ? "failed" : "sent",
          sent_at: sent.error ? null : new Date().toISOString(),
          resend_id: sendId,
        })
        .eq("id", row.id);

      if (sent.error) {
        return respond.serverError("Email failed", sent.error.message);
      }
    } catch (sendErr) {
      await supabase
        .from("project_emails")
        .update({ status: "failed" })
        .eq("id", row.id);
      return respond.serverError(
        "Email failed",
        sendErr instanceof Error ? sendErr.message : String(sendErr),
      );
    }

    return respond.created({ email: { ...row, status: "sent" } });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to send email",
      error instanceof Error ? error.message : String(error),
    );
  }
}
