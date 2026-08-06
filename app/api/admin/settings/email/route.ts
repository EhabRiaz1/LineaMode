import { revalidateTag } from "next/cache";
import { respond } from "@/lib/api/responses";
import { cmsTags } from "@/lib/cms/cache-tags";
import {
  EMAIL_TEMPLATES_SETTING_KEY,
  EMAIL_TEMPLATE_DEFAULTS,
  emailTemplatesSchema,
  parseEmailTemplates,
} from "@/lib/email/template-schema";
import { RESEND_FROM, RESEND_REPLY_TO } from "@/lib/email/resend";
import { getBriefRecipients } from "@/lib/email/load-delivery";
import {
  getServiceRoleClient,
  requireAdminUser,
  UnauthorizedError,
} from "@/lib/supabase/client";

/**
 * Read/write the editable email templates plus the read-only delivery config
 * the console displays (From/Reply-To come from env, not the database, so the
 * UI shows them rather than pretending they're editable).
 */

async function deliveryConfig() {
  // Recipients are CMS-editable; reflect the resolved value, not the env var.
  const { recipients } = await getBriefRecipients();
  return {
    from: RESEND_FROM,
    replyTo: recipients[0] ?? RESEND_REPLY_TO,
    deliversTo: recipients.join(", "),
    autoReplyEnabled: !["false", "0", "off", "no"].includes(
      (process.env.CONTACT_AUTO_REPLY ?? "true").toLowerCase(),
    ),
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    // Surfaced so a misconfigured sandbox sender is obvious in the UI rather
    // than silently swallowing every recipient except the account owner.
    usingSandboxSender: RESEND_FROM.includes("resend.dev"),
  };
}

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("cms_settings")
      .select("value")
      .eq("key", EMAIL_TEMPLATES_SETTING_KEY)
      .maybeSingle();

    if (error) {
      return respond.serverError("Unable to load email templates", error.message);
    }

    return respond.ok({
      templates: data?.value ? parseEmailTemplates(data.value) : EMAIL_TEMPLATE_DEFAULTS,
      usingDefaults: !data?.value,
      config: await deliveryConfig(),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load email templates",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);

    const body = await request.json().catch(() => null);
    const parsed = emailTemplatesSchema.safeParse(body?.templates);
    if (!parsed.success) {
      return respond.badRequest(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
      );
    }

    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("cms_settings").upsert(
      {
        key: EMAIL_TEMPLATES_SETTING_KEY,
        value: parsed.data,
        updated_by: admin.id,
      },
      { onConflict: "key" },
    );

    if (error) {
      return respond.serverError("Unable to save email templates", error.message);
    }

    // Send paths read through the cached getSetting(), so the tag must drop
    // or the next auto-reply still renders the previous copy.
    revalidateTag(cmsTags.setting(EMAIL_TEMPLATES_SETTING_KEY), "max");
    revalidateTag(cmsTags.settingsIndex(), "max");

    return respond.ok({ templates: parsed.data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to save email templates",
      error instanceof Error ? error.message : String(error),
    );
  }
}
