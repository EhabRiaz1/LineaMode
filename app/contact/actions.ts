"use server";

import { z } from "zod";
import {
  hasSupabaseConfig,
  persistContactSubmission,
} from "@/lib/contact/persist";
import { getResendClient, RESEND_FROM } from "@/lib/email/resend";
import { contactAutoReply } from "@/lib/email/templates";

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

function contactAutoReplyEnabled() {
  const flag = process.env.CONTACT_AUTO_REPLY?.toLowerCase();
  return flag !== "false" && flag !== "0" && flag !== "off" && flag !== "no";
}

function logResendFailure(
  kind: "admin notification" | "auto-reply",
  meta: { to: string; from: string },
  result: { error?: { message: string } | null },
) {
  if (!result.error) return;
  console.error(`[contact] ${kind} failed`, {
    ...meta,
    message: result.error.message,
  });
}

async function sendContactEmails(data: z.infer<typeof ContactSchema>) {
  const resend = getResendClient();
  if (!resend) return false;

  const adminTo = process.env.CONTACT_EMAIL_TO ?? "saif@lineamode.com";
  const from = process.env.CONTACT_EMAIL_FROM ?? RESEND_FROM;
  const { name, brand, email, productType, moq, message } = data;

  const adminResult = await resend.emails.send({
    to: adminTo,
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
  logResendFailure("admin notification", { to: adminTo, from }, adminResult);

  if (contactAutoReplyEnabled()) {
    const reply = contactAutoReply({ name, brand, productType, moq });
    const autoResult = await resend.emails.send({
      from,
      to: email,
      replyTo: adminTo,
      subject: reply.subject,
      text: reply.text,
      html: reply.html,
    });
    logResendFailure("auto-reply", { to: email, from }, autoResult);
  } else {
    console.info("[contact] auto-reply skipped (CONTACT_AUTO_REPLY disabled)");
  }

  return true;
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

  const submission = {
    name: parsed.data.name,
    brand: parsed.data.brand,
    email: parsed.data.email,
    productType: parsed.data.productType,
    moq: parsed.data.moq,
    message: parsed.data.message,
  };

  const supabaseReady = hasSupabaseConfig();
  let persistFailed = false;

  if (supabaseReady) {
    try {
      await persistContactSubmission(submission);
    } catch (err) {
      persistFailed = true;
      console.error("[contact] persist failed", err);
    }
  } else {
    console.info("[contact] Supabase not configured — skipping inbox persist.");
  }

  try {
    const emailed = await sendContactEmails(parsed.data);
    if (!emailed) {
      console.info("[contact] RESEND_API_KEY not set — email skipped.", {
        email: submission.email,
        brand: submission.brand,
      });
      if (!supabaseReady) {
        return {
          status: "error",
          errors: {},
          message:
            "Something went wrong sending your brief. Please email saif@lineamode.com directly.",
          values,
        };
      }
    }
  } catch (err) {
    console.error("[contact] Resend send failed", err);
    if (!supabaseReady) {
      return {
        status: "error",
        errors: {},
        message:
          "Something went wrong sending your brief. Please email saif@lineamode.com directly.",
        values,
      };
    }
  }

  if (persistFailed) {
    return {
      status: "error",
      errors: {},
      message:
        "Something went wrong saving your brief. Please try again or email saif@lineamode.com directly.",
      values,
    };
  }

  return { status: "success" };
}
