/**
 * Who receives contact-form briefs and intake notifications.
 *
 * This lived in the `CONTACT_EMAIL_TO` env var, which meant changing the
 * recipient required a redeploy. It is a destination address, not a
 * credential, so it belongs in the CMS next to the templates.
 *
 * Isomorphic — the admin console imports the schema to validate before saving.
 */

import { z } from "zod";

export const emailDeliverySchema = z.object({
  recipients: z
    .array(z.string().trim().toLowerCase().email("Enter a valid email address."))
    .min(1, "At least one recipient is required.")
    .max(10, "Ten recipients maximum.")
    // Two people pasting the same address shouldn't double-send.
    .refine((list) => new Set(list).size === list.length, {
      message: "Duplicate addresses are not allowed.",
    }),
});

export type EmailDelivery = z.infer<typeof emailDeliverySchema>;

/** cms_settings key holding the recipient list. */
export const EMAIL_DELIVERY_SETTING_KEY = "email_delivery";

/**
 * Last-resort recipient, used only when neither the CMS row nor
 * `CONTACT_EMAIL_TO` is set. On the verified sending domain on purpose.
 */
export const FALLBACK_RECIPIENT = "contact@lineamode-apparel.com";
