"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { CONTACT_CONTENT_DEFAULTS, parseContactContent, type ContactContent } from "@/lib/cms/contact-schema";
import {
  saveContactContentDraft,
  publishContactContent,
  discardContactContentDraft,
} from "@/app/admin/(console)/content/_actions";
import { Field, SectionAccordion, EditorShell } from "./EditorFields";

export function ContactEditor() {
  const { token, authHeaders, status } = useAdminSession();
  const [content, setContent] = useState<ContactContent>(CONTACT_CONTENT_DEFAULTS);
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
    const res = await adminFetch<{ published: ContactContent | null; draft: ContactContent | null }>(
      "/api/admin/cms/contact", { authHeaders: authHeaders() }
    );
    if (res.ok) {
      setContent(parseContactContent(res.data.draft ?? res.data.published ?? CONTACT_CONTENT_DEFAULTS));
      setHasDraft(!!res.data.draft);
      setDirty(false);
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
      const r = await saveContactContentDraft(token, content);
      if (r.ok) { setHasDraft(true); setPreviewNonce(n => n + 1); }
      setPreviewSaving(false);
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  const update = useCallback((next: ContactContent) => { setContent(next); setDirty(true); }, []);

  const onSaveDraft = async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true); setError(null);
    const r = await saveContactContentDraft(token, content);
    setSaving(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(true); setPreviewNonce(n => n + 1);
  };

  const onPublish = async () => {
    if (timer.current) clearTimeout(timer.current);
    setPublishing(true); setError(null);
    if (dirty) { const s = await saveContactContentDraft(token, content); if (!s.ok) { setError(s.error); setPublishing(false); return; } }
    const r = await publishContactContent(token);
    setPublishing(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(false); setPreviewNonce(n => n + 1);
  };

  const onDiscard = async () => {
    setDiscarding(true);
    await discardContactContentDraft(token);
    setDiscarding(false); void load();
  };

  if (loading) return <p className="text-body text-ink/55">Loading editor…</p>;

  const intro = content.intro;
  const det = content.details;

  return (
    <EditorShell
      title="Contact"
      backHref="/admin/content/pages"
      hasDraft={hasDraft} dirty={dirty} saving={saving} publishing={publishing}
      discarding={discarding} error={error}
      previewSrc="/admin/preview/contact" previewSaving={previewSaving}
      previewNonce={previewNonce} liveSiteHref="/contact"
      fullPreviewHref="/admin/preview/contact"
      onSaveDraft={onSaveDraft} onPublish={onPublish} onDiscard={onDiscard}
    >
      <SectionAccordion id="intro" label="Intro" selected={selected} onSelect={setSelected}>
        <Field label="Eyebrow" value={intro.eyebrow}
          onChange={(v) => update({ ...content, intro: { ...intro, eyebrow: v } })} />
        <Field label="Headline — line 1" value={intro.headlineLine1}
          onChange={(v) => update({ ...content, intro: { ...intro, headlineLine1: v } })} />
        <Field label="Headline — line 2 (italic)" value={intro.headlineLine2}
          onChange={(v) => update({ ...content, intro: { ...intro, headlineLine2: v } })} />
      </SectionAccordion>

      <SectionAccordion id="details" label="Contact details" selected={selected} onSelect={setSelected}>
        <Field label="Email address" value={det.email}
          onChange={(v) => update({ ...content, details: { ...det, email: v } })} />
        <Field label="Address" value={det.address} multiline rows={4}
          placeholder={"Line 1,\nLine 2,\nCity, Country."}
          onChange={(v) => update({ ...content, details: { ...det, address: v } })} />
        <Field label="Office hours" value={det.hours}
          onChange={(v) => update({ ...content, details: { ...det, hours: v } })} />
        <Field label="Form section label" value={det.formSectionLabel}
          onChange={(v) => update({ ...content, details: { ...det, formSectionLabel: v } })} />
      </SectionAccordion>
    </EditorShell>
  );
}
