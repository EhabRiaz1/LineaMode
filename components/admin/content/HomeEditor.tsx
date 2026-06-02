"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  HOME_CONTENT_DEFAULTS,
  parseHomeContent,
  type HomeContent,
} from "@/lib/cms/home-schema";
import {
  saveHomeContentDraft,
  publishHomeContent,
  discardHomeContentDraft,
} from "@/app/admin/(console)/content/_actions";
import { capabilities } from "@/content/capabilities";
import { homeProducts } from "@/content/home-products";
import { cn } from "@/lib/utils";
import { ImagePickerField } from "./EditorFields";

// ─── Tiny reusable form fields ──────────────────────────────────────────────

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

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={cn(
            "w-10 h-6 rounded-full transition-colors",
            checked ? "bg-ink" : "bg-ink/20",
          )}
        />
        <div
          className={cn(
            "absolute top-1 left-1 size-4 rounded-full bg-stone transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </div>
      <div>
        <p className="text-body text-ink">{label}</p>
        {description && <p className="text-label text-ink/55">{description}</p>}
      </div>
    </label>
  );
}

function CtaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { label: string; href: string };
  onChange: (v: { label: string; href: string }) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--hairline)] p-3 space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>
      <Field
        label="Button label"
        value={value.label}
        onChange={(v) => onChange({ ...value, label: v })}
      />
      <Field
        label="Link URL"
        value={value.href}
        onChange={(v) => onChange({ ...value, href: v })}
      />
    </div>
  );
}

// ─── Section accordion ───────────────────────────────────────────────────────

function SectionAccordion({
  id,
  label,
  selected,
  onSelect,
  enabled,
  children,
}: {
  id: string;
  label: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  enabled?: boolean;
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
        <div className="flex items-center gap-2">
          {enabled === false && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink/8 text-ink/50 uppercase tracking-widest">
              off
            </span>
          )}
          <span className="text-ink/35 group-open:rotate-180 transition-transform">▼</span>
        </div>
      </summary>
      <div className="px-5 pb-5 pt-2 border-t border-[var(--hairline)] space-y-4">{children}</div>
    </details>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function HomeEditor() {
  const { token, authHeaders, status } = useAdminSession();
  const [content, setContent] = useState<HomeContent>(HOME_CONTENT_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>("hero");
  const [previewNonce, setPreviewNonce] = useState(0);
  const [previewSaving, setPreviewSaving] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    const res = await adminFetch<{
      published: HomeContent | null;
      draft: HomeContent | null;
    }>("/api/admin/cms/home", { authHeaders: authHeaders() });
    if (res.ok) {
      const base = res.data.draft ?? res.data.published ?? HOME_CONTENT_DEFAULTS;
      const parsed = parseHomeContent(base);

      // Pre-populate from static content files when CMS has no items yet
      if (!parsed.capabilities.items.length) {
        parsed.capabilities = {
          ...parsed.capabilities,
          items: capabilities.map((c) => ({ title: c.title, short: c.short, image: "" })),
        };
      }
      if (!parsed.products.tiles.length) {
        parsed.products = {
          ...parsed.products,
          tiles: homeProducts.map((p) => ({
            title: p.title,
            caption: p.caption,
            poster: p.poster,
            imageAlt: p.imageAlt,
          })),
        };
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

  // Debounced auto-save → triggers iframe reload
  useEffect(() => {
    if (!dirty || status !== "authenticated") return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!token) return;
      setPreviewSaving(true);
      const result = await saveHomeContentDraft(token, content);
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

  const update = useCallback((next: HomeContent) => {
    setContent(next);
    setDirty(true);
  }, []);

  const onSaveDraft = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    setError(null);
    const result = await saveHomeContentDraft(token, content);
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
      const save = await saveHomeContentDraft(token, content);
      if (!save.ok) { setError(save.error); setPublishing(false); return; }
    }
    const result = await publishHomeContent(token);
    setPublishing(false);
    if (!result.ok) { setError(result.error); return; }
    setDirty(false);
    setHasDraft(false);
    setPreviewNonce((n) => n + 1);
  };

  const onDiscard = async () => {
    if (!hasDraft) return;
    setDiscarding(true);
    setError(null);
    await discardHomeContentDraft(token);
    setDiscarding(false);
    void load();
  };

  if (loading) {
    return <p className="text-body text-ink/55">Loading editor…</p>;
  }

  const h = content.hero;
  const w = content.whatWeDo;
  const p = content.products;
  const id = content.identity;
  const j = content.journal;
  const c = content.contactCta;
  const cap = content.capabilities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="space-y-1">
          <Link href="/admin/content/pages" className="text-label text-ink/55 hover:text-ink">
            ← All pages
          </Link>
          <h1 className="text-h2 text-ink">Home</h1>
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

        {/* ── Left: section accordions ── */}
        <div className="space-y-3">
          <p className="text-eyebrow text-ink/45">Homepage sections</p>

          {/* 01 Hero */}
          <SectionAccordion id="hero" label="01 / Hero" selected={selected} onSelect={setSelected}>
            <Field
              label="Eyebrow"
              value={h.eyebrow}
              onChange={(v) => update({ ...content, hero: { ...h, eyebrow: v } })}
            />
            <Field
              label="Headline — line 1"
              value={h.headlineLine1}
              onChange={(v) => update({ ...content, hero: { ...h, headlineLine1: v } })}
            />
            <Field
              label="Headline — line 2 (italic)"
              value={h.headlineLine2}
              onChange={(v) => update({ ...content, hero: { ...h, headlineLine2: v } })}
            />
            <Field
              label="Top-right descriptor"
              value={h.description}
              placeholder="e.g. Knitwear · Performance Polyester · Soft Wovens"
              onChange={(v) => update({ ...content, hero: { ...h, description: v } })}
            />
            <Field
              label="Bottom tagline"
              value={h.bottomLabel}
              onChange={(v) => update({ ...content, hero: { ...h, bottomLabel: v } })}
            />
            <ImagePickerField
              label="Background image"
              value={h.image}
              onChange={(v) => update({ ...content, hero: { ...h, image: v } })}
            />
            <CtaField
              label="Primary CTA"
              value={h.primaryCta}
              onChange={(v) => update({ ...content, hero: { ...h, primaryCta: v } })}
            />
            <CtaField
              label="Secondary CTA"
              value={h.secondaryCta}
              onChange={(v) => update({ ...content, hero: { ...h, secondaryCta: v } })}
            />
          </SectionAccordion>

          {/* 02 What We Do */}
          <SectionAccordion
            id="whatWeDo"
            label="02 / What We Do"
            selected={selected}
            onSelect={setSelected}
            enabled={w.enabled}
          >
            <Toggle
              label="Show section"
              checked={w.enabled}
              onChange={(v) => update({ ...content, whatWeDo: { ...w, enabled: v } })}
            />
            {w.enabled && (
              <>
                <Field
                  label="Eyebrow"
                  value={w.eyebrow}
                  onChange={(v) => update({ ...content, whatWeDo: { ...w, eyebrow: v } })}
                />
                <Field
                  label="Headline — line 1"
                  value={w.headlineLine1}
                  onChange={(v) => update({ ...content, whatWeDo: { ...w, headlineLine1: v } })}
                />
                <Field
                  label="Headline — line 2 (italic)"
                  value={w.headlineLine2}
                  onChange={(v) => update({ ...content, whatWeDo: { ...w, headlineLine2: v } })}
                />
                <p className="text-label text-ink/45">
                  Capability titles and descriptions are edited in{" "}
                  <button
                    type="button"
                    className="underline hover:text-ink"
                    onClick={() => setSelected("capabilities")}
                  >
                    07 / Capabilities
                  </button>
                  .
                </p>
              </>
            )}
          </SectionAccordion>

          {/* 03 Products */}
          <SectionAccordion
            id="products"
            label="03 / Products"
            selected={selected}
            onSelect={setSelected}
            enabled={p.enabled}
          >
            <Toggle
              label="Show section"
              checked={p.enabled}
              onChange={(v) => update({ ...content, products: { ...p, enabled: v } })}
            />
            {p.enabled && (
              <p className="text-label text-ink/55">
                The homepage now shows a rail of products marked “Featured” in the{" "}
                <Link href="/admin/content/pages" className="underline hover:text-ink">
                  Products page editor
                </Link>
                . There&rsquo;s nothing else to configure here besides showing or
                hiding this section.
              </p>
            )}
          </SectionAccordion>

          {/* 04 Identity */}
          <SectionAccordion
            id="identity"
            label="04 / Identity"
            selected={selected}
            onSelect={setSelected}
            enabled={id.enabled}
          >
            <Toggle
              label="Show section"
              checked={id.enabled}
              onChange={(v) => update({ ...content, identity: { ...id, enabled: v } })}
            />
            {id.enabled && (
              <>
                <Field
                  label="Eyebrow"
                  value={id.eyebrow}
                  onChange={(v) => update({ ...content, identity: { ...id, eyebrow: v } })}
                />
                <Field
                  label="Headline"
                  value={id.headline}
                  onChange={(v) => update({ ...content, identity: { ...id, headline: v } })}
                />
                <Field
                  label="Headline — italic continuation"
                  value={id.headlineItalic}
                  onChange={(v) =>
                    update({ ...content, identity: { ...id, headlineItalic: v } })
                  }
                />
                <Field
                  label="Body"
                  value={id.body}
                  multiline
                  rows={4}
                  onChange={(v) => update({ ...content, identity: { ...id, body: v } })}
                />
                <ImagePickerField
                  label="Background image"
                  value={id.image}
                  placeholder="/images/home/identity-office.jpg or https://…"
                  onChange={(v) => update({ ...content, identity: { ...id, image: v } })}
                />
              </>
            )}
          </SectionAccordion>

          {/* 05 Journal */}
          <SectionAccordion
            id="journal"
            label="05 / Journal"
            selected={selected}
            onSelect={setSelected}
            enabled={j.enabled}
          >
            <Toggle
              label="Show section"
              checked={j.enabled}
              onChange={(v) => update({ ...content, journal: { ...j, enabled: v } })}
            />
            {j.enabled && (
              <>
                <Field
                  label="Eyebrow"
                  value={j.eyebrow}
                  onChange={(v) => update({ ...content, journal: { ...j, eyebrow: v } })}
                />
                <Field
                  label="Headline — line 1"
                  value={j.headlineLine1}
                  onChange={(v) => update({ ...content, journal: { ...j, headlineLine1: v } })}
                />
                <Field
                  label="Headline — line 2 (italic)"
                  value={j.headlineLine2}
                  onChange={(v) => update({ ...content, journal: { ...j, headlineLine2: v } })}
                />
                <Field
                  label="Body"
                  value={j.body}
                  multiline
                  rows={3}
                  onChange={(v) => update({ ...content, journal: { ...j, body: v } })}
                />
                <CtaField
                  label="CTA button"
                  value={{ label: j.ctaLabel, href: j.ctaHref }}
                  onChange={(v) =>
                    update({ ...content, journal: { ...j, ctaLabel: v.label, ctaHref: v.href } })
                  }
                />
              </>
            )}
          </SectionAccordion>

          {/* 06 Contact CTA */}
          <SectionAccordion
            id="contactCta"
            label="06 / Contact CTA"
            selected={selected}
            onSelect={setSelected}
            enabled={c.enabled}
          >
            <Toggle
              label="Show section"
              checked={c.enabled}
              onChange={(v) => update({ ...content, contactCta: { ...c, enabled: v } })}
            />
            {c.enabled && (
              <>
                <Field
                  label="Eyebrow"
                  value={c.eyebrow}
                  onChange={(v) => update({ ...content, contactCta: { ...c, eyebrow: v } })}
                />
                <Field
                  label="Headline — line 1"
                  value={c.headlineLine1}
                  onChange={(v) =>
                    update({ ...content, contactCta: { ...c, headlineLine1: v } })
                  }
                />
                <Field
                  label="Headline — line 2 (italic)"
                  value={c.headlineLine2}
                  onChange={(v) =>
                    update({ ...content, contactCta: { ...c, headlineLine2: v } })
                  }
                />
                <Field
                  label="Body"
                  value={c.body}
                  multiline
                  rows={3}
                  onChange={(v) => update({ ...content, contactCta: { ...c, body: v } })}
                />
                <Field
                  label="Email"
                  value={c.email}
                  onChange={(v) => update({ ...content, contactCta: { ...c, email: v } })}
                />
                <Field
                  label="Phone"
                  value={c.phone}
                  onChange={(v) => update({ ...content, contactCta: { ...c, phone: v } })}
                />
                <p className="text-label text-ink/45">
                  The live section embeds the contact form and opens email/phone in blur modals from the left column.
                </p>
              </>
            )}
          </SectionAccordion>

          {/* 07 Capabilities */}
          <SectionAccordion
            id="capabilities"
            label="07 / Capabilities"
            selected={selected}
            onSelect={setSelected}
            enabled={cap.enabled}
          >
            <Toggle
              label="Show section"
              checked={cap.enabled}
              onChange={(v) => update({ ...content, capabilities: { ...cap, enabled: v } })}
            />
            {cap.enabled && (
              <>
                <Field
                  label="Section headline"
                  value={cap.headline}
                  onChange={(v) =>
                    update({ ...content, capabilities: { ...cap, headline: v } })
                  }
                />
                <Field
                  label="Headline — italic continuation"
                  value={cap.headlineItalic}
                  onChange={(v) =>
                    update({ ...content, capabilities: { ...cap, headlineItalic: v } })
                  }
                />
                <div className="space-y-3 pt-1">
                  <p className="text-eyebrow text-ink/40">Carousel cards</p>
                  <p className="text-label text-ink/45">
                    These cards also power the What We Do section.
                  </p>
                  {cap.items.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[var(--hairline)] p-3 space-y-2"
                    >
                      <p className="text-label text-ink/60 font-medium">
                        Card {i + 1} — {item.title || "Untitled"}
                      </p>
                      <Field
                        label="Title"
                        value={item.title}
                        onChange={(v) => {
                          const items = [...cap.items];
                          items[i] = { ...items[i], title: v };
                          update({ ...content, capabilities: { ...cap, items } });
                        }}
                      />
                      <Field
                        label="Description"
                        value={item.short}
                        multiline
                        rows={3}
                        onChange={(v) => {
                          const items = [...cap.items];
                          items[i] = { ...items[i], short: v };
                          update({ ...content, capabilities: { ...cap, items } });
                        }}
                      />
                      <ImagePickerField
                        label="Card image"
                        value={item.image ?? ""}
                        placeholder="Leave blank to use the default image"
                        onChange={(v) => {
                          const items = [...cap.items];
                          items[i] = { ...items[i], image: v };
                          update({ ...content, capabilities: { ...cap, items } });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionAccordion>
        </div>

        {/* ── Right: live preview iframe ── */}
        <div className="lg:sticky lg:top-4">
          <div className="rounded-2xl border border-[var(--hairline)] bg-stone overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hairline)]">
              <div>
                <p className="text-body text-ink font-medium">Live Preview</p>
                <p className="text-label text-ink/55">
                  {previewSaving ? "Refreshing…" : "Auto-refreshes after each edit"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/preview/home"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
                >
                  Full preview ↗
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-ink text-stone px-4 py-1.5 text-label hover:bg-ink/85 transition-colors"
                >
                  Live site →
                </Link>
              </div>
            </div>
            <div className="relative bg-stone">
              {previewSaving && (
                <div className="absolute inset-0 z-10 bg-stone/70 flex items-center justify-center">
                  <p className="text-label text-ink/55">Refreshing preview…</p>
                </div>
              )}
              <iframe
                key={previewNonce}
                src="/admin/preview/home"
                title="Homepage draft preview"
                className="w-full border-0"
                style={{ height: "78vh", minHeight: 520 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
