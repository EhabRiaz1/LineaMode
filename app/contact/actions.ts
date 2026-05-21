"use server";

import { z } from "zod";
import { Resend } from "resend";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please share your name."),
  brand: z.string().trim().min(1, "Please share your brand."),
  email: z.string().trim().email("Please use a valid email."),
  productType: z.string().trim().min(1, "Tell us what you're making."),
  moq: z.string().trim().optional(),
  message: z.string().trim().min(10, "A short brief, please — at least a sentence."),
  // Honeypot — humans leave this empty.
  company_url: z.string().optional(),
});

export type ContactState =
  | { status: "idle" }
  | {
      status: "error";
      errors: Partial<Record<keyof z.infer<typeof ContactSchema>, string>>;
      message?: string;
      values?: Record<string, string>;
    }
  | { status: "success" };

function formValuesFromRaw(raw: Record<string, FormDataEntryValue>) {
  return {
    name: String(raw.name ?? ""),
    brand: String(raw.brand ?? ""),
    email: String(raw.email ?? ""),
    productType: String(raw.productType ?? ""),
    moq: String(raw.moq ?? ""),
    message: String(raw.message ?? ""),
  };
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = Object.fromEntries(formData.entries());
  const values = formValuesFromRaw(raw);
  const parsed = ContactSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { status: "error", errors, values };
  }

  // Honeypot trip — silently succeed so bots don't learn anything.
  if (parsed.data.company_url && parsed.data.company_url.length > 0) {
    return { status: "success" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO ?? "saif@lineamode.com";
  const from = process.env.CONTACT_EMAIL_FROM ?? "Lineamode <onboarding@resend.dev>";

  // If email isn't configured (e.g. in dev), log and pretend it succeeded so
  // the design can still be reviewed without a Resend key.
  if (!apiKey) {
    console.info("[contact] RESEND_API_KEY not set — logging instead.", parsed.data);
    return { status: "success" };
  }

  try {
    const resend = new Resend(apiKey);
    const { name, brand, email, productType, moq, message } = parsed.data;
    await resend.emails.send({
      to,
      from,
      replyTo: email,
      subject: `New brief from ${brand} (${name})`,
      text: [
        `Brand: ${brand}`,
        `Contact: ${name} <${email}>`,
        `Product type: ${productType}`,
        `MOQ: ${moq || "—"}`,
        ``,
        `Brief:`,
        message,
        ``,
        `— Sent from www.lineamode.com`,
      ].join("\n"),
    });
    return { status: "success" };
  } catch (err) {
    console.error("[contact] Resend send failed", err);
    return {
      status: "error",
      errors: {},
      message: "Something went wrong sending your brief. Please email saif@lineamode.com directly.",
      values,
    };
  }
}
