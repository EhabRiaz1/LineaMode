/**
 * Turns a structured EmailTemplate + variable values into the subject, plain
 * text and HTML that Resend actually sends.
 *
 * Isomorphic by design: the admin preview calls this in the browser and the
 * send path calls it on the server, so the preview cannot drift from reality.
 */

import type { EmailTemplate } from "./template-schema";

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function variableNamesIn(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER)].map((m) => m[1]);
}

function substitute(text: string, vars: Record<string, string | undefined>): string {
  return text.replace(PLACEHOLDER, (_all, name: string) => vars[name]?.trim() ?? "");
}

/**
 * A paragraph is dropped when it references variables and *every* one of them
 * is empty — that is what turns "You mentioned an MOQ of: {{moq}}." into
 * nothing when no MOQ was given. Paragraphs mixing a present and an absent
 * variable are kept, since dropping them would lose real copy.
 */
function keepParagraph(text: string, vars: Record<string, string | undefined>): boolean {
  const names = variableNamesIn(text);
  if (names.length === 0) return text.trim().length > 0;
  return names.some((name) => (vars[name] ?? "").trim().length > 0);
}

export function resolveParagraphs(
  template: EmailTemplate,
  vars: Record<string, string | undefined>,
): string[] {
  return template.paragraphs
    .filter((p) => keepParagraph(p, vars))
    .map((p) => substitute(p, vars).trim())
    .filter((p) => p.length > 0);
}

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

export function renderEmailTemplate(
  template: EmailTemplate,
  vars: Record<string, string | undefined>,
): RenderedEmail {
  const subject = substitute(template.subject, vars).trim();
  const eyebrow = substitute(template.eyebrow, vars).trim();
  const greeting = substitute(template.greeting, vars).trim();
  const signOff = substitute(template.signOff, vars).trim();
  const signature = substitute(template.signature, vars).trim();
  const paragraphs = resolveParagraphs(template, vars);

  const text = [
    greeting,
    "",
    ...paragraphs.flatMap((p) => [p, ""]),
    signOff,
    signature,
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n")
    .trim();

  const html = `
    <div style="font-family: 'Times New Roman', Georgia, serif; max-width: 560px; margin: 32px auto; line-height: 1.5; color: #1a1a1a;">
      ${
        eyebrow
          ? `<p style="font-family: ui-monospace, Menlo, monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #999; margin: 0 0 24px;">${escapeHtml(eyebrow)}</p>`
          : ""
      }
      ${greeting ? `<p>${escapeHtml(greeting)}</p>` : ""}
      ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n      ")}
      ${
        signOff || signature
          ? `<p style="margin-top: 32px;">${escapeHtml(signOff)}${
              signature ? `<br/><em>${escapeHtml(signature)}</em>` : ""
            }</p>`
          : ""
      }
    </div>
  `;

  return { subject, text, html };
}

/** Standalone document for the admin preview iframe. */
export function previewDocument(html: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{margin:0;background:#ffffff;}</style></head><body>${html}</body></html>`;
}
