import { resolveMx } from "node:dns/promises";
import { revalidateTag } from "next/cache";
import { respond } from "@/lib/api/responses";
import { cmsTags } from "@/lib/cms/cache-tags";
import {
  EMAIL_DELIVERY_SETTING_KEY,
  emailDeliverySchema,
} from "@/lib/email/delivery-schema";
import { getBriefRecipients } from "@/lib/email/load-delivery";
import {
  getServiceRoleClient,
  requireAdminUser,
  UnauthorizedError,
} from "@/lib/supabase/client";

/**
 * Read/write who receives contact-form briefs and intake notifications.
 *
 * Saves are validated but never blocked on DNS: a domain can be legitimately
 * mid-setup. Instead we return warnings so the console can show them. This is
 * the check that would have caught `saif@lineamode.com` — a recipient on a
 * domain with no mail server, which bounced silently for weeks.
 */

async function domainWarnings(recipients: string[]): Promise<string[]> {
  const domains = [...new Set(recipients.map((r) => r.split("@")[1]).filter(Boolean))];

  const results = await Promise.all(
    domains.map(async (domain) => {
      try {
        const mx = await resolveMx(domain);
        if (!mx || mx.length === 0) {
          return `${domain} has no MX record — mail sent there will bounce.`;
        }
        return null;
      } catch {
        // NXDOMAIN, SERVFAIL, timeouts. Report rather than fail the save.
        return `${domain} has no reachable MX record — mail sent there will likely bounce.`;
      }
    }),
  );

  return results.filter((value): value is string => value !== null);
}

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const resolved = await getBriefRecipients();
    return respond.ok({
      recipients: resolved.recipients,
      source: resolved.source,
      envFallback: process.env.CONTACT_EMAIL_TO ?? null,
      warnings: await domainWarnings(resolved.recipients),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load recipients",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);

    const body = await request.json().catch(() => null);
    const parsed = emailDeliverySchema.safeParse(body);
    if (!parsed.success) {
      return respond.badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("cms_settings").upsert(
      {
        key: EMAIL_DELIVERY_SETTING_KEY,
        value: parsed.data,
        updated_by: admin.id,
      },
      { onConflict: "key" },
    );

    if (error) return respond.serverError("Unable to save recipients", error.message);

    // Send paths read through the cached getSetting(), so the tag must drop or
    // the next brief still goes to the previous recipients.
    revalidateTag(cmsTags.setting(EMAIL_DELIVERY_SETTING_KEY), "max");
    revalidateTag(cmsTags.settingsIndex(), "max");

    return respond.ok({
      recipients: parsed.data.recipients,
      source: "cms" as const,
      warnings: await domainWarnings(parsed.data.recipients),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to save recipients",
      error instanceof Error ? error.message : String(error),
    );
  }
}
