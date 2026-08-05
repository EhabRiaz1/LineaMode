import "server-only";

import { getSetting } from "@/lib/cms";
import {
  EMAIL_TEMPLATES_SETTING_KEY,
  EMAIL_TEMPLATE_DEFAULTS,
  parseEmailTemplates,
  type EmailTemplate,
  type EmailTemplateKey,
  type EmailTemplates,
} from "./template-schema";

/**
 * Reads the admin-edited templates out of cms_settings.
 *
 * `getSetting` is cache-tagged, so this costs nothing on the hot path and is
 * invalidated by the admin save. Any failure — Supabase unconfigured, row
 * missing, malformed jsonb — falls back to the shipped defaults rather than
 * sending a blank email.
 */
export async function getEmailTemplates(): Promise<EmailTemplates> {
  try {
    const stored = await getSetting<unknown>(EMAIL_TEMPLATES_SETTING_KEY);
    if (!stored) return EMAIL_TEMPLATE_DEFAULTS;
    return parseEmailTemplates(stored);
  } catch (err) {
    console.error("[email] template load failed — using defaults", err);
    return EMAIL_TEMPLATE_DEFAULTS;
  }
}

export async function getEmailTemplate(key: EmailTemplateKey): Promise<EmailTemplate> {
  const all = await getEmailTemplates();
  return all[key];
}
