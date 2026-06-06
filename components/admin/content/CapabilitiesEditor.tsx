"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  CAPABILITIES_CONTENT_DEFAULTS,
  CAPABILITY_DEFAULT_IMAGES,
  DEFAULT_PROCESS_STEPS,
  parseCapabilitiesContent,
  type CapabilitiesContent,
} from "@/lib/cms/capabilities-schema";
import { capabilities as staticCapabilities } from "@/content/capabilities";
import {
  saveCapabilitiesContentDraft,
  publishCapabilitiesContent,
  discardCapabilitiesContentDraft,
} from "@/app/admin/(console)/content/_actions";
import { cn } from "@/lib/utils";
import { ImagePickerField } from "./EditorFields";
import { PreviewPanel } from "./PreviewPanel";

// ─── Field helpers ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  multiline,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-eyebrow text-ink/40 block mb-1">{label}</span>
      {multiline ? (
        <textarea
          rows={rows ?? 3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15 resize-y"
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
      )}
    </label>
  );
}

function ListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>
      {values.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={val}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="text-label text-ink/45 hover:text-terracotta px-2 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
      >
        + Add
      </button>
    </div>
  );
}

function SectionAccordion({
  id,
  label,
  selected,
  onSelect,
  children,
}: {
  id: string;
  label: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  children: React.ReactNode;
}) {
  const open = selected === id;
  return (
    <details
      open={open}
      onToggle={(e) => {
        if ((e.target as HTMLDetailsElement).open) onSelect(id);
        else if (open) onSelect(null);
      }}
      className="group rounded-2xl border border-[var(--hairline)] bg-stone overflow-hidden"
    >
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-ink/[0.02] transition-colors list-none">
        <span className="text-body text-ink font-medium">{label}</span>
        <span className="text-ink/35 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="px-5 pb-5 pt-2 border-t border-[var(--hairline)] space-y-4">{children}</div>
    </details>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function CapabilitiesEditor() {
  const { token, authHeaders, status } = useAdminSession();
  const [content, setContent] = useState<CapabilitiesContent>(CAPABILITIES_CONTENT_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>("intro");
  const [previewNonce, setPreviewNonce] = useState(0);
  const [previewSaving, setPreviewSaving] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    const res = await adminFetch<{
      published: CapabilitiesContent | null;
      draft: CapabilitiesContent | null;
    }>("/api/admin/cms/capabilities", { authHeaders: authHeaders() });

    if (res.ok) {
      const base = res.data.draft ?? res.data.published ?? CAPABILITIES_CONTENT_DEFAULTS;
      const parsed = parseCapabilitiesContent(base);

      // Pre-populate from static content when CMS is empty
      if (!parsed.capabilities.length) {
        parsed.capabilities = staticCapabilities.map((c, i) => ({
          title: c.title,
          short: c.short,
          description: c.description,
          bullets: [...c.bullets],
          image: CAPABILITY_DEFAULT_IMAGES[i] ?? "",
        }));
      }
      if (!parsed.process.steps.length) {
        parsed.process = { ...parsed.process, steps: [...DEFAULT_PROCESS_STEPS] };
      }

      setContent(parsed);
      setHasDraft(!!res.data.draft);
      setDirty(false);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Debounced auto-save → iframe refresh
  useEffect(() => {
    if (!dirty || status !== "authenticated") return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!token) return;
      setPreviewSaving(true);
      const result = await saveCapabilitiesContentDraft(token, content);
      if (result.ok) {
        setHasDraft(true);
        setPreviewNonce((n) => n + 1);
      }
      setPreviewSaving(false);
    }, 700);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  const update = useCallback((next: CapabilitiesContent) => {
    setContent(next);
    setDirty(true);
  }, []);

  const onSaveDraft = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    setError(null);
    const result = await saveCapabilitiesContentDraft(token, content);
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    setDirty(false);
    setHasDraft(true);
    setPreviewNonce((n) => n + 1);
  };

  const onPublish = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setPublishing(true);
    setError(null);
    if (dirty) {
      const save = await saveCapabilitiesContentDraft(token, content);
      if (!save.ok) { setError(save.error); setPublishing(false); return; }
    }
    const result = await publishCapabilitiesContent(token);
    setPublishing(false);
    if (!result.ok) { setError(result.error); return; }
    setDirty(false);
    setHasDraft(false);
    setPreviewNonce((n) => n + 1);
  };

  const onDiscard = async () => {
    setDiscarding(true);
    await discardCapabilitiesContentDraft(token);
    setDiscarding(false);
    void load();
  };

  if (loading) return <p className="text-body text-ink/55">Loading editor…</p>;

  const intro = content.intro;
  const caps = content.capabilities;
  const proc = content.process;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="space-y-1">
          <Link href="/admin/content/pages" className="text-label text-ink/55 hover:text-ink">
            ← All pages
          </Link>
          <h1 className="text-h2 text-ink">Services</h1>
          <p className="text-label text-ink/55">
            {hasDraft ? "Draft pending · " : ""}
            Changes auto-save and refresh the preview.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {dirty && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
              Unsaved changes
            </span>
          )}
          {hasDraft && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={discarding}
              className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/65 hover:bg-ink/5 transition-colors disabled:opacity-60"
            >
              {discarding ? "Discarding…" : "Discard draft"}
            </button>
          )}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving || publishing || !dirty}
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || saving}
            className="rounded-full bg-ink text-stone px-5 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">

        {/* ── Left: accordions ── */}
        <div className="space-y-3">
          <p className="text-eyebrow text-ink/45">Page sections</p>

          {/* Intro */}
          <SectionAccordion id="intro" label="Intro" selected={selected} onSelect={setSelected}>
            <Field
              label="Eyebrow"
              value={intro.eyebrow}
              onChange={(v) => update({ ...content, intro: { ...intro, eyebrow: v } })}
            />
            <Field
              label="Headline — line 1"
              value={intro.headlineLine1}
              onChange={(v) => update({ ...content, intro: { ...intro, headlineLine1: v } })}
            />
            <Field
              label="Headline — line 2 (italic)"
              value={intro.headlineLine2}
              onChange={(v) => update({ ...content, intro: { ...intro, headlineLine2: v } })}
            />
            <Field
              label="Body"
              value={intro.body}
              multiline
              rows={3}
              onChange={(v) => update({ ...content, intro: { ...intro, body: v } })}
            />
          </SectionAccordion>

          {/* Capability detail blocks */}
          {caps.map((cap, i) => (
            <SectionAccordion
              key={i}
              id={`cap-${i}`}
              label={`${String(i + 1).padStart(2, "0")} / ${cap.title || `Capability ${i + 1}`}`}
              selected={selected}
              onSelect={setSelected}
            >
              <Field
                label="Title"
                value={cap.title}
                onChange={(v) => {
                  const next = [...caps];
                  next[i] = { ...next[i], title: v };
                  update({ ...content, capabilities: next });
                }}
              />
              <ImagePickerField
                label="Card image"
                value={cap.image}
                placeholder={CAPABILITY_DEFAULT_IMAGES[i] ?? "https://…"}
                onChange={(v) => {
                  const next = [...caps];
                  next[i] = { ...next[i], image: v };
                  update({ ...content, capabilities: next });
                }}
              />
              <Field
                label="Short description (shown on home page)"
                value={cap.short}
                multiline
                rows={3}
                onChange={(v) => {
                  const next = [...caps];
                  next[i] = { ...next[i], short: v };
                  update({ ...content, capabilities: next });
                }}
              />
              <Field
                label="Full description"
                value={cap.description}
                multiline
                rows={3}
                onChange={(v) => {
                  const next = [...caps];
                  next[i] = { ...next[i], description: v };
                  update({ ...content, capabilities: next });
                }}
              />
              <ListField
                label="Bullet points"
                values={cap.bullets}
                placeholder="e.g. Trend forecasting and seasonal direction"
                onChange={(v) => {
                  const next = [...caps];
                  next[i] = { ...next[i], bullets: v };
                  update({ ...content, capabilities: next });
                }}
              />
            </SectionAccordion>
          ))}

          {/* Process */}
          <SectionAccordion
            id="process"
            label="Process"
            selected={selected}
            onSelect={setSelected}
          >
            <Field
              label="Eyebrow"
              value={proc.eyebrow}
              onChange={(v) => update({ ...content, process: { ...proc, eyebrow: v } })}
            />
            <Field
              label="Headline — line 1"
              value={proc.headlineLine1}
              onChange={(v) => update({ ...content, process: { ...proc, headlineLine1: v } })}
            />
            <Field
              label="Headline — line 2 (italic)"
              value={proc.headlineLine2}
              onChange={(v) => update({ ...content, process: { ...proc, headlineLine2: v } })}
            />
            <Field
              label="Body"
              value={proc.body}
              multiline
              rows={3}
              onChange={(v) => update({ ...content, process: { ...proc, body: v } })}
            />
            <div className="space-y-3">
              <p className="text-eyebrow text-ink/40">Steps</p>
              {proc.steps.map((step, i) => (
                <div key={i} className="rounded-xl border border-[var(--hairline)] p-3 space-y-2">
                  <p className="text-label text-ink/55 font-medium">
                    Step {step.step} — {step.title}
                  </p>
                  <Field
                    label="Step number"
                    value={step.step}
                    onChange={(v) => {
                      const steps = [...proc.steps];
                      steps[i] = { ...steps[i], step: v };
                      update({ ...content, process: { ...proc, steps } });
                    }}
                  />
                  <Field
                    label="Title"
                    value={step.title}
                    onChange={(v) => {
                      const steps = [...proc.steps];
                      steps[i] = { ...steps[i], title: v };
                      update({ ...content, process: { ...proc, steps } });
                    }}
                  />
                  <Field
                    label="Note"
                    value={step.note}
                    onChange={(v) => {
                      const steps = [...proc.steps];
                      steps[i] = { ...steps[i], note: v };
                      update({ ...content, process: { ...proc, steps } });
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--hairline)] p-3 space-y-2">
              <p className="text-eyebrow text-ink/40">CTA button</p>
              <Field
                label="Label"
                value={proc.ctaLabel}
                onChange={(v) => update({ ...content, process: { ...proc, ctaLabel: v } })}
              />
              <Field
                label="URL"
                value={proc.ctaHref}
                onChange={(v) => update({ ...content, process: { ...proc, ctaHref: v } })}
              />
            </div>
          </SectionAccordion>
        </div>

        <PreviewPanel
          subtitle={previewSaving ? "Refreshing…" : "Auto-refreshes after each edit"}
          previewSrc="/admin/preview/capabilities"
          previewNonce={previewNonce}
          previewSaving={previewSaving}
          iframeTitle="Capabilities draft preview"
          actions={
            <>
              <Link
                href="/admin/preview/capabilities"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
              >
                Full preview ↗
              </Link>
              <Link
                href="/capabilities"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-ink px-4 py-1.5 text-label text-stone hover:bg-ink/85 transition-colors"
              >
                Live site →
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}
