import { respond } from "@/lib/api/responses";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { intakePayloadSchema } from "@/lib/validators/intake";
import { hashIp, parseIp } from "@/lib/utils/ip";
import { getResendClient, RESEND_FROM } from "@/lib/email/resend";
import { customerAutoReply, adminNotification } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = intakePayloadSchema.safeParse(body);
    if (!parsed.success) {
      return respond.badRequest("Invalid intake payload", parsed.error.flatten());
    }

    const payload = parsed.data;
    const supabase = getServiceRoleClient();
    const ipHash = hashIp(parseIp(request));
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .upsert(
        {
          email: payload.email,
          name: payload.name,
          company: payload.company,
          phone: payload.phone,
          country: payload.country,
          timeline: payload.timeline,
          budget_range: payload.budgetRange,
          attribution: payload.attribution ?? null,
          device: payload.device ?? null,
        },
        { onConflict: "email" }
      )
      .select("*")
      .single();

    if (customerError || !customer) {
      return respond.serverError("Unable to save customer", customerError?.message);
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        customer_id: customer.id,
        pipeline_type: payload.pipelineType,
        status: "draft",
        current_step: "intake_submitted",
        brief: payload.brief,
        brand_stage: payload.signals?.brand_stage ?? null,
        calendar_tier: payload.signals?.calendar_tier ?? null,
        volume_bracket: payload.signals?.volume_bracket ?? null,
        priorities: payload.signals?.priorities ?? [],
      })
      .select("*")
      .single();

    if (projectError || !project) {
      return respond.serverError("Unable to create project", projectError?.message);
    }

    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .insert({
        project_id: project.id,
        intake: payload,
        notes: payload.notes ?? null,
      })
      .select("*")
      .single();

    if (enquiryError || !enquiry) {
      return respond.serverError("Unable to store enquiry", enquiryError?.message);
    }

    if (payload.files?.length) {
      const attachmentRows = payload.files.map((file) => ({
        project_id: project.id,
        customer_id: customer.id,
        file_name: file.name,
        file_type: file.type ?? null,
        file_size_bytes: file.size ?? null,
        storage_path: file.path ?? `intake-uploads/${project.id}/${file.name}`,
      }));
      const { error: attachmentError } = await supabase.from("attachments").insert(attachmentRows);
      if (attachmentError) {
        return respond.serverError("Unable to store attachment metadata", attachmentError.message);
      }
    }

    await supabase.from("pipeline_steps").insert({
      project_id: project.id,
      label: "intake_submitted",
      state: "done",
      note: "Customer submitted intake form",
      actor_role: "system",
    });

    // Funnel close-out event for intake analytics.
    await supabase.from("intake_events").insert({
      session_id: payload.attribution?.session_id ?? null,
      customer_id: customer.id,
      project_id: project.id,
      event: "intake_submitted",
      payload: { pipelineType: payload.pipelineType },
      ip_hash: ipHash,
      user_agent: userAgent,
    });

    // Fire the customer auto-reply + admin notification. We `await` so the
    // emails actually send before the function exits in serverless
    // environments (Vercel, etc.) where post-response work gets killed.
    // Failures here never fail the request — the project is already saved.
    const resend = getResendClient();
    if (resend) {
      const adminTo = process.env.CONTACT_EMAIL_TO ?? "saif@lineamode.com";
      await Promise.allSettled([
        (async () => {
          const reply = await customerAutoReply(payload);
          const sent = await resend.emails.send({
            from: RESEND_FROM,
            to: payload.email,
            replyTo: adminTo,
            subject: reply.subject,
            text: reply.text,
            html: reply.html,
          });
          await supabase.from("project_emails").insert({
            project_id: project.id,
            to_address: payload.email,
            subject: reply.subject,
            body: reply.text,
            status: sent.error ? "failed" : "sent",
            sent_at: sent.error ? null : new Date().toISOString(),
            resend_id: sent.data?.id ?? null,
          });
        })(),
        (async () => {
          const note = adminNotification(payload, project.id);
          await resend.emails.send({
            from: RESEND_FROM,
            to: adminTo,
            subject: note.subject,
            text: note.text,
            html: note.html,
            replyTo: payload.email,
          });
        })(),
      ]);
    }

    return respond.created({
      projectId: project.id,
      customerId: customer.id,
      enquiryId: enquiry.id,
      status: project.status,
    });
  } catch (error) {
    return respond.serverError(
      "Failed to process intake",
      error instanceof Error ? error.message : String(error)
    );
  }
}
