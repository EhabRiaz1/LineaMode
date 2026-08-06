import "server-only";

import { getSetting } from "@/lib/cms";
import {
  EMAIL_DELIVERY_SETTING_KEY,
  emailDeliverySchema,
  FALLBACK_RECIPIENT,
} from "./delivery-schema";

export type ResolvedRecipients = {
  recipients: string[];
  /** Where the value came from — surfaced in the admin UI. */
  source: "cms" | "env" | "default";
};

/** Recipients from `CONTACT_EMAIL_TO`, which may hold a comma-separated list. */
function envRecipients(): string[] {
  return (process.env.CONTACT_EMAIL_TO ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Resolution order: CMS row → `CONTACT_EMAIL_TO` → hard default.
 *
 * The env fallback is deliberate — an existing deployment with no CMS row
 * keeps behaving exactly as before, so enabling this feature changes nothing
 * until someone actually edits the list.
 */
export async function getBriefRecipients(): Promise<ResolvedRecipients> {
  try {
    const stored = await getSetting<unknown>(EMAIL_DELIVERY_SETTING_KEY);
    const parsed = emailDeliverySchema.safeParse(stored);
    if (parsed.success) {
      return { recipients: parsed.data.recipients, source: "cms" };
    }
  } catch (err) {
    console.error("[email] recipient load failed — falling back to env", err);
  }

  const fromEnv = envRecipients();
  if (fromEnv.length > 0) return { recipients: fromEnv, source: "env" };

  return { recipients: [FALLBACK_RECIPIENT], source: "default" };
}

/**
 * Reply-To for outbound mail. We send as studio@, so replies must be pointed
 * at a mailbox someone reads — the first configured recipient.
 */
export async function getReplyToAddress(): Promise<string> {
  const { recipients } = await getBriefRecipients();
  return recipients[0] ?? FALLBACK_RECIPIENT;
}
