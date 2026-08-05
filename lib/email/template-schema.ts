/**
 * Editable email templates.
 *
 * Deliberately *structured* rather than raw HTML: admins edit a subject,
 * greeting, body paragraphs and sign-off, while the surrounding markup,
 * escaping and inlined styles stay in `render.ts` where they can be tested.
 * That means a bad paste can never break rendering in Outlook/Gmail.
 *
 * This module is isomorphic on purpose — the admin console imports it to
 * drive the live preview, so the preview and the real send agree by
 * construction instead of by hand-syncing two copies.
 */

import { z } from "zod";

export const emailTemplateSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required.").max(200),
  eyebrow: z.string().trim().max(80).default(""),
  greeting: z.string().trim().max(200).default(""),
  paragraphs: z.array(z.string().trim().max(2000)).max(12).default([]),
  signOff: z.string().trim().max(120).default(""),
  signature: z.string().trim().max(120).default(""),
});

export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

export const EMAIL_TEMPLATE_KEYS = ["contact_auto_reply", "intake_auto_reply"] as const;
export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export const emailTemplatesSchema = z.object({
  contact_auto_reply: emailTemplateSchema,
  intake_auto_reply: emailTemplateSchema,
});

export type EmailTemplates = z.infer<typeof emailTemplatesSchema>;

/** cms_settings key holding the published templates. */
export const EMAIL_TEMPLATES_SETTING_KEY = "email_templates";

/**
 * A variable an admin may reference as `{{name}}`. `sample` drives the admin
 * preview so the editor shows realistic copy rather than raw placeholders.
 */
export type TemplateVariable = {
  name: string;
  description: string;
  sample: string;
  /** Optional at send time — paragraphs referencing only empty vars are dropped. */
  optional?: boolean;
};

export type TemplateDefinition = {
  key: EmailTemplateKey;
  label: string;
  description: string;
  /** Who receives it, for the admin UI. */
  audience: string;
  variables: TemplateVariable[];
};

export const TEMPLATE_DEFINITIONS: Record<EmailTemplateKey, TemplateDefinition> = {
  contact_auto_reply: {
    key: "contact_auto_reply",
    label: "Contact form auto-reply",
    description:
      "Sent to anyone who submits the brief form on /contact, immediately after their message is saved.",
    audience: "The person who filled in the contact form",
    variables: [
      { name: "firstName", description: "First name only", sample: "Sarah" },
      { name: "name", description: "Full name, including title", sample: "Sarah Okonkwo, Founder" },
      { name: "brand", description: "Brand or company name", sample: "Meridian Studio" },
      { name: "productType", description: "What they want made", sample: "heavyweight jersey tees" },
      { name: "moq", description: "Order quantity", sample: "500 units", optional: true },
    ],
  },
  intake_auto_reply: {
    key: "intake_auto_reply",
    label: "Project intake auto-reply",
    description:
      "Sent to anyone who completes the longer /start intake letter, once their project record is created.",
    audience: "The person who submitted the /start letter",
    variables: [
      { name: "firstName", description: "First name only", sample: "Sarah" },
      { name: "name", description: "Full name", sample: "Sarah Okonkwo" },
      { name: "pipelineType", description: "Which pipeline they chose", sample: "Design from an idea" },
      { name: "company", description: "Company name", sample: "Meridian Studio", optional: true },
      { name: "timeline", description: "Their stated timeline", sample: "Q1 2027 launch", optional: true },
      { name: "budgetRange", description: "Their stated budget", sample: "$20k – $40k", optional: true },
    ],
  },
};

/**
 * Shipped copy. These are the fallback whenever Supabase is unconfigured or
 * the stored value fails validation, so email never silently degrades to an
 * empty body.
 */
export const EMAIL_TEMPLATE_DEFAULTS: EmailTemplates = {
  contact_auto_reply: {
    subject: "We have your brief, {{firstName}}.",
    eyebrow: "/ Lineamode · Studio reply",
    greeting: "Hi {{firstName}},",
    paragraphs: [
      "Thanks for reaching out — your brief has landed at Lineamode.",
      "We've received your enquiry for {{brand}} ({{productType}}). Someone from the founding team reads every brief by hand, and we usually reply within two working days with a few sharper questions and next steps.",
      "You mentioned an MOQ of: {{moq}}.",
      "If something changes between now and our reply, just write back to this email — your project is already in our queue.",
    ],
    signOff: "— The studio",
    signature: "Lineamode Apparel",
  },
  intake_auto_reply: {
    subject: "We have your letter, {{firstName}}.",
    eyebrow: "/ Lineamode · Studio reply",
    greeting: "Hi {{firstName}},",
    paragraphs: [
      "Thanks for the letter — it's landed at Lineamode.",
      "We've logged your enquiry for {{pipelineType}}. Someone from the founding team reads every brief by hand, and we usually reply within two working days with a few sharper questions and a calendar.",
      "You mentioned a timeline of: {{timeline}}.",
      "Budget shape: {{budgetRange}}.",
      "If something changes between now and our reply, just write back to this email — your project is already in our queue.",
    ],
    signOff: "— The studio",
    signature: "Lineamode Apparel",
  },
};

/** Parse stored templates, falling back to defaults per-template. */
export function parseEmailTemplates(raw: unknown): EmailTemplates {
  const result = emailTemplatesSchema.safeParse(raw);
  if (result.success) return result.data;

  // Partial / legacy rows: keep whatever validates, default the rest, so one
  // malformed template can't blank out the other.
  const partial = (raw ?? {}) as Record<string, unknown>;
  const out = {} as EmailTemplates;
  for (const key of EMAIL_TEMPLATE_KEYS) {
    const single = emailTemplateSchema.safeParse(partial[key]);
    out[key] = single.success ? single.data : EMAIL_TEMPLATE_DEFAULTS[key];
  }
  return out;
}

/** Sample variable values for a template, used by the admin preview. */
export function sampleVariables(key: EmailTemplateKey): Record<string, string> {
  return Object.fromEntries(
    TEMPLATE_DEFINITIONS[key].variables.map((v) => [v.name, v.sample]),
  );
}
