import { z } from "zod";
import { respond } from "@/lib/api/responses";
import { getResendClient, RESEND_FROM, RESEND_REPLY_TO } from "@/lib/email/resend";
import { renderEmailTemplate } from "@/lib/email/render";
import {
  emailTemplateSchema,
  EMAIL_TEMPLATE_KEYS,
  sampleVariables,
} from "@/lib/email/template-schema";
import { requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

/**
 * Sends the template currently on screen to an address of the admin's
 * choosing, using the sample variable values shown in the preview. Renders
 * from the posted (unsaved) template on purpose, so copy can be proofed in a
 * real inbox before publishing.
 */

const testSchema = z.object({
  key: z.enum(EMAIL_TEMPLATE_KEYS),
  template: emailTemplateSchema,
  to: z.string().trim().email("Enter a valid email address."),
});

export async function POST(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);

    const parsed = testSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return respond.badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const resend = getResendClient();
    if (!resend) {
      return respond.badRequest(
        "RESEND_API_KEY is not configured, so no test email can be sent.",
      );
    }

    const { key, template, to } = parsed.data;
    const rendered = renderEmailTemplate(template, sampleVariables(key));

    const sent = await resend.emails.send({
      from: RESEND_FROM,
      to,
      replyTo: RESEND_REPLY_TO,
      subject: `[Test] ${rendered.subject}`,
      text: rendered.text,
      html: rendered.html,
    });

    if (sent.error) {
      // Surface Resend's own message — for an unverified domain it says so
      // explicitly, which is far more useful than a generic failure.
      return respond.badRequest(`Resend rejected the send: ${sent.error.message}`);
    }

    return respond.ok({ id: sent.data?.id ?? null, to, from: RESEND_FROM });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to send test email",
      error instanceof Error ? error.message : String(error),
    );
  }
}
