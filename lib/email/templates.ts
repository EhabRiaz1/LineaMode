import "server-only";
import type { IntakePayload } from "@/lib/validators/intake";

const PIPELINE_LABELS: Record<IntakePayload["pipelineType"], string> = {
  design_idea: "Design from an idea",
  design_scratch: "Design from scratch",
  manufacture_existing: "Manufacture from a CAD",
};

/**
 * Plain-text first; clients render the prose-style copy faithfully and
 * inboxes can quote it cleanly. The HTML body is a thin wrapper that adds
 * minimal editorial styling without breaking dark-mode-aware clients.
 */
export function customerAutoReply(payload: IntakePayload) {
  const firstName = payload.name.split(/\s+/)[0] || "Friend";
  const text = [
    `Hi ${firstName},`,
    "",
    "Thanks for the letter — it's landed at Lineamode.",
    "",
    `We've logged your enquiry for ${PIPELINE_LABELS[payload.pipelineType]}. Someone from the founding team reads every brief by hand, and we usually reply within two working days with a few sharper questions and a calendar.`,
    "",
    payload.timeline ? `You mentioned a timeline of: ${payload.timeline}.` : "",
    payload.budgetRange ? `Budget shape: ${payload.budgetRange}.` : "",
    "",
    "If something changes between now and our reply, just write back to this email — your project is already in our queue.",
    "",
    "— The studio",
    "Lineamode Apparel",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: 'Times New Roman', Georgia, serif; max-width: 560px; margin: 32px auto; line-height: 1.5; color: #1a1a1a;">
      <p style="font-family: ui-monospace, Menlo, monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #999; margin: 0 0 24px;">
        / Lineamode · Studio reply
      </p>
      <p>Hi ${firstName},</p>
      <p>Thanks for the letter — it's landed at Lineamode.</p>
      <p>We've logged your enquiry for <strong>${PIPELINE_LABELS[payload.pipelineType]}</strong>. Someone from the founding team reads every brief by hand, and we usually reply within two working days with a few sharper questions and a calendar.</p>
      ${payload.timeline ? `<p>You mentioned a timeline of: <em>${escapeHtml(payload.timeline)}</em>.</p>` : ""}
      ${payload.budgetRange ? `<p>Budget shape: <em>${escapeHtml(payload.budgetRange)}</em>.</p>` : ""}
      <p>If something changes between now and our reply, just write back to this email — your project is already in our queue.</p>
      <p style="margin-top: 32px;">— The studio<br/><em>Lineamode Apparel</em></p>
    </div>
  `;

  return {
    subject: `We have your letter, ${firstName}.`,
    text,
    html,
  };
}

export function adminNotification(payload: IntakePayload, projectId: string) {
  const subject = `New intake · ${payload.name}${payload.company ? ` (${payload.company})` : ""} · ${PIPELINE_LABELS[payload.pipelineType]}`;
  const lines = [
    `New /start letter received.`,
    "",
    `Pipeline: ${PIPELINE_LABELS[payload.pipelineType]}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
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
