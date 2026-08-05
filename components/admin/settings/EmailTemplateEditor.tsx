"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { previewDocument, renderEmailTemplate } from "@/lib/email/render";
import {
  EMAIL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_DEFAULTS,
  TEMPLATE_DEFINITIONS,
  sampleVariables,
  type EmailTemplate,
  type EmailTemplateKey,
  type EmailTemplates,
} from "@/lib/email/template-schema";
import { cn } from "@/lib/utils";

type DeliveryConfig = {
  from: string;
  replyTo: string;
  deliversTo: string;
  autoReplyEnabled: boolean;
  resendConfigured: boolean;
  usingSandboxSender: boolean;
};

type LoadResponse = {
  templates: EmailTemplates;
  usingDefaults: boolean;
  config: DeliveryConfig;
};

export function EmailTemplateEditor() {
  const { authHeaders, status } = useAdminSession();

  const [templates, setTemplates] = useState<EmailTemplates | null>(null);
  const [config, setConfig] = useState<DeliveryConfig | null>(null);
  const [activeKey, setActiveKey] = useState<EmailTemplateKey>("contact_auto_reply");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [testTo, setTestTo] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // State is set inside the promise callback rather than in the effect body,
  // which is the pattern react-hooks/set-state-in-effect asks for: the effect
  // subscribes to an external system and updates state when it answers.
  const load = useCallback(() => {
    if (status !== "authenticated") return () => {};
    let cancelled = false;
    adminFetch<LoadResponse>("/api/admin/settings/email", {
      authHeaders: authHeaders(),
    }).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setTemplates(res.data.templates);
        setConfig(res.data.config);
        setError(null);
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authHeaders, status]);

  useEffect(() => load(), [load]);

  const active = templates?.[activeKey] ?? null;
  const definition = TEMPLATE_DEFINITIONS[activeKey];

  const preview = useMemo(() => {
    if (!active) return null;
    return renderEmailTemplate(active, sampleVariables(activeKey));
  }, [active, activeKey]);

  const update = (patch: Partial<EmailTemplate>) => {
    if (!templates) return;
    setTemplates({ ...templates, [activeKey]: { ...templates[activeKey], ...patch } });
    setDirty(true);
    setNotice(null);
  };

  const updateParagraph = (index: number, value: string) => {
    if (!active) return;
    const next = [...active.paragraphs];
    next[index] = value;
    update({ paragraphs: next });
  };

  const addParagraph = () => {
    if (!active) return;
    update({ paragraphs: [...active.paragraphs, ""] });
  };

  const removeParagraph = (index: number) => {
    if (!active) return;
    update({ paragraphs: active.paragraphs.filter((_, i) => i !== index) });
  };

  const moveParagraph = (index: number, direction: -1 | 1) => {
    if (!active) return;
    const target = index + direction;
    if (target < 0 || target >= active.paragraphs.length) return;
    const next = [...active.paragraphs];
    [next[index], next[target]] = [next[target], next[index]];
    update({ paragraphs: next });
  };

  const save = async () => {
    if (!templates) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    const res = await adminFetch<{ templates: EmailTemplates }>(
      "/api/admin/settings/email",
      {
        authHeaders: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ templates }),
      },
    );
    setSaving(false);
    if (res.ok) {
      setTemplates(res.data.templates);
      setDirty(false);
      setNotice("Templates published. New emails use this copy immediately.");
    } else {
      setError(res.error);
    }
  };

  const resetToShipped = () => {
    if (!templates) return;
    setTemplates({ ...templates, [activeKey]: EMAIL_TEMPLATE_DEFAULTS[activeKey] });
    setDirty(true);
    setNotice(null);
  };

  const sendTest = async () => {
    if (!active) return;
    setSendingTest(true);
    setError(null);
    setNotice(null);
    const res = await adminFetch<{ to: string; from: string }>(
      "/api/admin/settings/email/test",
      {
        authHeaders: authHeaders(),
        method: "POST",
        body: JSON.stringify({ key: activeKey, template: active, to: testTo }),
      },
    );
    setSendingTest(false);
    if (res.ok) {
      setNotice(`Test sent to ${res.data.to} from ${res.data.from}.`);
    } else {
      setError(res.error);
    }
  };

  if (loading) {
    return <p className="text-body text-ink/55">Loading email templates…</p>;
  }

  if (!templates || !active || !preview) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        {error ?? "Email templates are unavailable."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {config && <DeliveryBanner config={config} />}

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-body text-moss">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {EMAIL_TEMPLATE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveKey(key)}
            className={cn(
              "rounded-full border px-4 py-2 text-label transition-colors",
              key === activeKey
                ? "border-ink bg-ink text-stone"
                : "border-[var(--hairline)] text-ink/70 hover:border-[var(--hairline-strong)] hover:text-ink",
            )}
          >
            {TEMPLATE_DEFINITIONS[key].label}
          </button>
        ))}
      </div>

      <p className="text-body text-ink/70">{definition.description}</p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ── Editor ─────────────────────────────────────────────── */}
        <div className="space-y-5 rounded-3xl border border-[var(--hairline)] bg-stone p-6">
          <Field label="Subject line">
            <input
              value={active.subject}
              onChange={(e) => update({ subject: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Eyebrow" hint="Small uppercase label above the message.">
            <input
              value={active.eyebrow}
              onChange={(e) => update({ eyebrow: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Greeting">
            <input
              value={active.greeting}
              onChange={(e) => update({ greeting: e.target.value })}
              className={inputClass}
            />
          </Field>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-label text-ink/55">Body paragraphs</p>
              <button
                type="button"
                onClick={addParagraph}
                className="text-label text-ink/65 hover:text-ink hover:underline"
              >
                + Add paragraph
              </button>
            </div>

            {active.paragraphs.map((paragraph, index) => (
              <div key={index} className="space-y-1.5">
                <textarea
                  value={paragraph}
                  onChange={(e) => updateParagraph(index, e.target.value)}
                  rows={3}
                  className={cn(inputClass, "resize-y")}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => moveParagraph(index, -1)}
                    disabled={index === 0}
                    className="text-label text-ink/50 hover:text-ink disabled:opacity-30"
                  >
                    ↑ Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveParagraph(index, 1)}
                    disabled={index === active.paragraphs.length - 1}
                    className="text-label text-ink/50 hover:text-ink disabled:opacity-30"
                  >
                    ↓ Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeParagraph(index)}
                    className="text-label text-ink/50 hover:text-terracotta"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sign-off">
              <input
                value={active.signOff}
                onChange={(e) => update({ signOff: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Signature">
              <input
                value={active.signature}
                onChange={(e) => update({ signature: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <VariableGuide activeKey={activeKey} />
        </div>

        {/* ── Preview ────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-label text-ink/55">Preview</p>
            <div className="flex gap-1 rounded-full border border-[var(--hairline)] p-1">
              {(["desktop", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDevice(mode)}
                  className={cn(
                    "rounded-full px-3 py-1 text-label capitalize transition-colors",
                    device === mode ? "bg-ink text-stone" : "text-ink/60 hover:text-ink",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--hairline)] bg-stone p-4">
            <dl className="mb-4 space-y-1 border-b border-[var(--hairline)] pb-4">
              <PreviewMeta label="From" value={config?.from ?? "—"} />
              <PreviewMeta label="Reply-To" value={config?.replyTo ?? "—"} />
              <PreviewMeta label="Subject" value={preview.subject} />
            </dl>

            <div className={cn("mx-auto transition-[max-width]", device === "mobile" ? "max-w-[380px]" : "max-w-full")}>
              <iframe
                title="Email preview"
                srcDoc={previewDocument(preview.html)}
                className="h-[520px] w-full rounded-2xl border border-[var(--hairline)] bg-white"
              />
            </div>
          </div>

          <p className="text-label text-ink/45">
            Rendered with sample values by the same code that sends the real
            email, so this is exactly what recipients receive.
          </p>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--hairline)] bg-stone p-6">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-full bg-ink px-5 py-2.5 text-label text-stone transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {saving ? "Publishing…" : dirty ? "Publish changes" : "No changes"}
        </button>
        <button
          type="button"
          onClick={resetToShipped}
          className="rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink transition-colors hover:border-[var(--hairline-strong)]"
        >
          Reset to shipped copy
        </button>

        <div className="ml-auto flex items-center gap-2">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com"
            className={cn(inputClass, "w-56")}
          />
          <button
            type="button"
            onClick={sendTest}
            disabled={sendingTest || !testTo}
            className="whitespace-nowrap rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink transition-colors hover:border-[var(--hairline-strong)] disabled:opacity-40"
          >
            {sendingTest ? "Sending…" : "Send test"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none transition-colors focus:border-[var(--hairline-strong)]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-label text-ink/55">{label}</span>
      {children}
      {hint && <span className="block text-label text-ink/40">{hint}</span>}
    </label>
  );
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-label">
      <dt className="w-20 shrink-0 text-ink/45">{label}</dt>
      <dd className="min-w-0 break-words text-ink/80">{value}</dd>
    </div>
  );
}

function VariableGuide({ activeKey }: { activeKey: EmailTemplateKey }) {
  const { variables } = TEMPLATE_DEFINITIONS[activeKey];
  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-ink/[0.02] p-4">
      <p className="text-label text-ink/55">Variables</p>
      <ul className="mt-2 space-y-1">
        {variables.map((variable) => (
          <li key={variable.name} className="flex flex-wrap gap-x-2 text-label">
            <code className="text-ink">{`{{${variable.name}}}`}</code>
            <span className="text-ink/55">{variable.description}</span>
            {variable.optional && <span className="text-ink/40">· optional</span>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-label text-ink/45">
        A paragraph whose variables are all empty is dropped automatically —
        that is how the optional lines disappear when nothing was submitted.
      </p>
    </div>
  );
}

function DeliveryBanner({ config }: { config: DeliveryConfig }) {
  if (!config.resendConfigured) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        RESEND_API_KEY is not set — no email is being sent at all.
      </div>
    );
  }

  if (config.usingSandboxSender) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        Sending from <strong>{config.from}</strong>, Resend&rsquo;s sandbox
        address. It only delivers to the address on your own Resend account —
        clients receive nothing. Point <code>CONTACT_EMAIL_FROM</code> and{" "}
        <code>RESEND_FROM</code> at your verified domain.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-ink/[0.02] px-4 py-3">
      <div className="flex flex-wrap gap-x-8 gap-y-1 text-label">
        <span className="text-ink/55">
          Sending as <span className="text-ink">{config.from}</span>
        </span>
        <span className="text-ink/55">
          Replies to <span className="text-ink">{config.replyTo}</span>
        </span>
        <span className="text-ink/55">
          Briefs delivered to <span className="text-ink">{config.deliversTo}</span>
        </span>
        {!config.autoReplyEnabled && (
          <span className="text-terracotta">Auto-reply is disabled</span>
        )}
      </div>
    </div>
  );
}
