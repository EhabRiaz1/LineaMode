"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  FOUNDERS_CONTENT_DEFAULTS, parseFoundersContent,
  type FoundersContent, type FounderItem,
} from "@/lib/cms/founders-schema";
import { founders as staticFounders } from "@/content/founders";
import {
  saveFoundersContentDraft, publishFoundersContent, discardFoundersContentDraft,
} from "@/app/admin/(console)/content/_actions";
import { Field, ListField, CtaField, SectionAccordion, EditorShell } from "./EditorFields";

export function FoundersEditor() {
  const { token, authHeaders, status } = useAdminSession();
  const [content, setContent] = useState<FoundersContent>(FOUNDERS_CONTENT_DEFAULTS);
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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    const res = await adminFetch<{ published: FoundersContent | null; draft: FoundersContent | null }>(
      "/api/admin/cms/founders", { authHeaders: authHeaders() }
    );
    if (res.ok) {
      const parsed = parseFoundersContent(res.data.draft ?? res.data.published ?? FOUNDERS_CONTENT_DEFAULTS);
      if (!parsed.founders.length) {
        parsed.founders = staticFounders.map(f => ({
          name: f.name, role: f.role, phone: f.phone, email: f.email,
          website: f.website, address: f.address,
          bio: [...f.bio], focus: [...f.focus], pull: f.pull, portrait: f.portrait,
        }));
      }
      setContent(parsed); setHasDraft(!!res.data.draft); setDirty(false);
    } else setError(res.error);
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (!dirty || status !== "authenticated") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!token) return;
      setPreviewSaving(true);
      const r = await saveFoundersContentDraft(token, content);
      if (r.ok) { setHasDraft(true); setPreviewNonce(n => n + 1); }
      setPreviewSaving(false);
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  const update = useCallback((next: FoundersContent) => { setContent(next); setDirty(true); }, []);

  const updateFounder = (index: number, patch: Partial<FounderItem>) => {
    const founders = [...content.founders];
    founders[index] = { ...founders[index], ...patch };
    update({ ...content, founders });
  };

  const onSaveDraft = async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true); setError(null);
    const r = await saveFoundersContentDraft(token, content);
    setSaving(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(true); setPreviewNonce(n => n + 1);
  };

  const onPublish = async () => {
    if (timer.current) clearTimeout(timer.current);
    setPublishing(true); setError(null);
    if (dirty) { const s = await saveFoundersContentDraft(token, content); if (!s.ok) { setError(s.error); setPublishing(false); return; } }
    const r = await publishFoundersContent(token);
    setPublishing(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(false); setPreviewNonce(n => n + 1);
  };

  const onDiscard = async () => {
    setDiscarding(true);
    await discardFoundersContentDraft(token);
    setDiscarding(false); void load();
  };

  if (loading) return <p className="text-body text-ink/55">Loading editor…</p>;

  const intro = content.intro;
  const cta = content.cta;

  return (
    <EditorShell
      title="Founders"
      backHref="/admin/content/pages"
      hasDraft={hasDraft} dirty={dirty} saving={saving} publishing={publishing}
      discarding={discarding} error={error}
      previewSrc="/admin/preview/founders" previewSaving={previewSaving}
      previewNonce={previewNonce} liveSiteHref="/founders"
      fullPreviewHref="/admin/preview/founders"
      onSaveDraft={onSaveDraft} onPublish={onPublish} onDiscard={onDiscard}
    >
      {/* Intro */}
      <SectionAccordion id="intro" label="Intro" selected={selected} onSelect={setSelected}>
        <Field label="Eyebrow" value={intro.eyebrow}
          onChange={(v) => update({ ...content, intro: { ...intro, eyebrow: v } })} />
        <Field label="Headline — line 1" value={intro.headlineLine1}
          onChange={(v) => update({ ...content, intro: { ...intro, headlineLine1: v } })} />
        <Field label="Headline — line 2 (italic)" value={intro.headlineLine2}
          onChange={(v) => update({ ...content, intro: { ...intro, headlineLine2: v } })} />
        <Field label="Body" value={intro.body} multiline rows={3}
          onChange={(v) => update({ ...content, intro: { ...intro, body: v } })} />
      </SectionAccordion>

      {/* Founder cards */}
      {content.founders.map((f, i) => (
        <SectionAccordion
          key={i}
          id={`founder-${i}`}
          label={`${String(i + 1).padStart(2, "0")} / ${f.name || `Founder ${i + 1}`}`}
          selected={selected} onSelect={setSelected}
        >
          <Field label="Full name" value={f.name} onChange={(v) => updateFounder(i, { name: v })} />
          <Field label="Role / title" value={f.role} onChange={(v) => updateFounder(i, { role: v })} />
          <Field label="Email" value={f.email} onChange={(v) => updateFounder(i, { email: v })} />
          <Field label="Phone" value={f.phone} placeholder="+92 300 0000000"
            onChange={(v) => updateFounder(i, { phone: v })} />
          <Field label="Website" value={f.website} onChange={(v) => updateFounder(i, { website: v })} />
          <Field label="Address (shown on business card)" value={f.address} multiline rows={2}
            onChange={(v) => updateFounder(i, { address: v })} />
          <ListField label="Bio paragraphs" values={f.bio}
            placeholder="Write a bio paragraph…"
            onChange={(v) => updateFounder(i, { bio: v })} />
          <Field label="Pull quote" value={f.pull} multiline rows={2}
            placeholder="A memorable quote from this founder…"
            onChange={(v) => updateFounder(i, { pull: v })} />
          <ListField label="Focus areas" values={f.focus}
            placeholder="e.g. Commercial strategy"
            onChange={(v) => updateFounder(i, { focus: v })} />
        </SectionAccordion>
      ))}

      {/* Closing CTA */}
      <SectionAccordion id="cta" label="Closing CTA" selected={selected} onSelect={setSelected}>
        <Field label="Eyebrow" value={cta.eyebrow}
          onChange={(v) => update({ ...content, cta: { ...cta, eyebrow: v } })} />
        <Field label="Headline — line 1" value={cta.headlineLine1}
          onChange={(v) => update({ ...content, cta: { ...cta, headlineLine1: v } })} />
        <Field label="Headline — line 2 (italic)" value={cta.headlineLine2}
          onChange={(v) => update({ ...content, cta: { ...cta, headlineLine2: v } })} />
        <Field label="Body" value={cta.body} multiline rows={3}
          onChange={(v) => update({ ...content, cta: { ...cta, body: v } })} />
        <CtaField label="CTA button"
          value={{ label: cta.ctaLabel, href: cta.ctaHref }}
          onChange={(v) => update({ ...content, cta: { ...cta, ctaLabel: v.label, ctaHref: v.href } })} />
      </SectionAccordion>
    </EditorShell>
  );
}
