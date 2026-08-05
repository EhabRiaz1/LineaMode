import "server-only";
import type { IntakePayload } from "@/lib/validators/intake";
import { getEmailTemplate } from "./load-templates";
import { renderEmailTemplate, type RenderedEmail } from "./render";

export const PIPELINE_LABELS: Record<IntakePayload["pipelineType"], string> = {
  design_idea: "Design from an idea",
  design_scratch: "Design from scratch",
  manufacture_existing: "Manufacture from a CAD",
};

/**
 * The two customer-facing auto-replies render from templates editable at
 * /admin/settings/email. Copy lives in cms_settings; layout, escaping and
 * variable substitution live in render.ts. The admin notification below stays
 * code-generated — it's an internal data dump, not brand copy.
 */
export type ContactAutoReplyData = {
  name: string;
  brand: string;
  productType: string;
  moq?: string;
};

export async function contactAutoReply(
  data: ContactAutoReplyData,
): Promise<RenderedEmail> {
  const template = await getEmailTemplate("contact_auto_reply");
  return renderEmailTemplate(template, {
    firstName: data.name.split(/\s+/)[0] || "Friend",
    name: data.name,
    brand: data.brand,
    productType: data.productType,
    moq: data.moq ?? "",
  });
}

export async function customerAutoReply(
  payload: IntakePayload,
): Promise<RenderedEmail> {
  const template = await getEmailTemplate("intake_auto_reply");
  return renderEmailTemplate(template, {
    firstName: payload.name.split(/\s+/)[0] || "Friend",
    name: payload.name,
    pipelineType: PIPELINE_LABELS[payload.pipelineType],
    company: payload.company ?? "",
    timeline: payload.timeline ?? "",
    budgetRange: payload.budgetRange ?? "",
  });
}

export function adminNotification(payload: IntakePayload, projectId: string) {
  const subject = `New intake · ${payload.name}${payload.company ? ` (${payload.company})` : ""} · ${PIPELINE_LABELS[payload.pipelineType]}`;
  const lines = [
    `New /start letter received.`,
    "",
    `Pipeline: ${PIPELINE_LABELS[payload.pipelineType]}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    payload.company ? `Company: ${payload.company}` : null,
    payload.country ? `Country: ${payload.country}` : null,
    payload.timeline ? `Timeline: ${payload.timeline}` : null,
    payload.budgetRange ? `Budget: ${payload.budgetRange}` : null,
    "",
    "— Brief —",
    JSON.stringify(payload.brief, null, 2),
    "",
    payload.notes ? `Notes: ${payload.notes}` : "",
    "",
    `Open in admin: /admin/projects/${projectId}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: ui-monospace, Menlo, monospace; max-width: 640px; margin: 32px auto; color: #1a1a1a; font-size: 13px; line-height: 1.65;">
      <p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #999; margin: 0 0 16px;">
        / New intake
      </p>
      <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 400; margin: 0 0 24px;">
        ${escapeHtml(payload.name)} — ${PIPELINE_LABELS[payload.pipelineType]}
      </h1>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 4px 0; color: #888;">Email</td><td>${escapeHtml(payload.email)}</td></tr>
        <tr><td style="padding: 4px 0; color: #888;">Phone</td><td>${escapeHtml(payload.phone)}</td></tr>
        ${payload.company ? `<tr><td style="padding: 4px 0; color: #888;">Company</td><td>${escapeHtml(payload.company)}</td></tr>` : ""}
        ${payload.country ? `<tr><td style="padding: 4px 0; color: #888;">Country</td><td>${escapeHtml(payload.country)}</td></tr>` : ""}
        ${payload.timeline ? `<tr><td style="padding: 4px 0; color: #888;">Timeline</td><td>${escapeHtml(payload.timeline)}</td></tr>` : ""}
        ${payload.budgetRange ? `<tr><td style="padding: 4px 0; color: #888;">Budget</td><td>${escapeHtml(payload.budgetRange)}</td></tr>` : ""}
      </table>
      <p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #999; margin: 24px 0 8px;">Brief</p>
      <pre style="background: #f5f3ee; padding: 12px; border-radius: 8px; white-space: pre-wrap; font-size: 12px;">${escapeHtml(JSON.stringify(payload.brief, null, 2))}</pre>
      ${payload.notes ? `<p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #999; margin: 24px 0 8px;">Notes</p><p>${escapeHtml(payload.notes)}</p>` : ""}
      <p style="margin-top: 32px;"><a href="/admin/projects/${projectId}" style="color: #1a1a1a;">Open in admin →</a></p>
    </div>
  `;
  return { subject, text: lines, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
