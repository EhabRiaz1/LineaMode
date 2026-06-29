"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  ABOUT_CONTENT_DEFAULTS,
  parseAboutContent,
  type AboutContent,
} from "@/lib/cms/about-schema";
import {
  saveAboutContentDraft,
  publishAboutContent,
  discardAboutContentDraft,
} from "@/app/admin/(console)/content/_actions";
import {
  Field,
  ImagePickerField,
  ListField,
  SectionAccordion,
  EditorShell,
} from "./EditorFields";

export function AboutEditor() {
  const { token, authHeaders, status } = useAdminSession();
  const [content, setContent] = useState<AboutContent>(ABOUT_CONTENT_DEFAULTS);
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
    const res = await adminFetch<{ published: AboutContent | null; draft: AboutContent | null }>(
      "/api/admin/cms/about",
      { authHeaders: authHeaders() },
    );
    if (res.ok) {
      const parsed = parseAboutContent(res.data.draft ?? res.data.published ?? ABOUT_CONTENT_DEFAULTS);
      if (!parsed.foundersCta.cards.length) {
        parsed.foundersCta = {
          ...parsed.foundersCta,
          cards: ABOUT_CONTENT_DEFAULTS.foundersCta.cards,
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

  useEffect(() => {
    if (!dirty || status !== "authenticated") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!token) return;
      setPreviewSaving(true);
      const r = await saveAboutContentDraft(token, content);
      if (r.ok) { setHasDraft(true); setPreviewNonce((n) => n + 1); }
      setPreviewSaving(false);
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  const update = useCallback((next: AboutContent) => { setContent(next); setDirty(true); }, []);

  const onSaveDraft = async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true); setError(null);
    const r = await saveAboutContentDraft(token, content);
    setSaving(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(true); setPreviewNonce((n) => n + 1);
  };
  const onPublish = async () => {
    if (timer.current) clearTimeout(timer.current);
    setPublishing(true); setError(null);
    if (dirty) { const s = await saveAboutContentDraft(token, content); if (!s.ok) { setError(s.error); setPublishing(false); return; } }
    const r = await publishAboutContent(token);
    setPublishing(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(false); setPreviewNonce((n) => n + 1);
  };
  const onDiscard = async () => {
    setDiscarding(true);
    await discardAboutContentDraft(token);
    setDiscarding(false); void load();
  };

  if (loading) return <p className="text-body text-ink/55">Loading editor…</p>;

  const intro = content.intro;
  const man = content.manifesto;
  const fcta = content.foundersCta;
  const hq = content.hq;

  return (
    <EditorShell
      title="About"
      backHref="/admin/content/pages"
      hasDraft={hasDraft} dirty={dirty} saving={saving} publishing={publishing}
      discarding={discarding} error={error}
      previewSrc="/admin/preview/about" previewSaving={previewSaving}
      previewNonce={previewNonce} liveSiteHref="/about"
      fullPreviewHref="/admin/preview/about"
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
      </SectionAccordion>

      {/* Manifesto */}
      <SectionAccordion id="manifesto" label="Manifesto" selected={selected} onSelect={setSelected}>
        <Field label="Section label" value={man.sectionLabel}
          onChange={(v) => update({ ...content, manifesto: { ...man, sectionLabel: v } })} />
        <Field label="Headline" value={man.headlineLine1}
          onChange={(v) => update({ ...content, manifesto: { ...man, headlineLine1: v } })} />
        <Field label="Headline — italic continuation" value={man.headlineItalic}
          onChange={(v) => update({ ...content, manifesto: { ...man, headlineItalic: v } })} />
        <Field label="Subheadline" value={man.subheadline} multiline rows={2}
          onChange={(v) => update({ ...content, manifesto: { ...man, subheadline: v } })} />
        <div className="space-y-3">
          <p className="text-eyebrow text-ink/40">Group logos</p>
          <p className="text-body text-ink/55">
            Tone-on-tone PNG wordmarks, stacked vertically in section 01. Upload one image per company.
          </p>
          {man.brandLogos.map((logo, i) => (
            <div key={logo.name} className="rounded-xl border border-[var(--hairline)] p-3 space-y-2">
              <p className="text-label text-ink/60 font-medium">{logo.name}</p>
              <ImagePickerField
                label="Logo image"
                frame="video"
                value={logo.image}
                onChange={(v) => {
                  const brandLogos = [...man.brandLogos];
                  brandLogos[i] = { ...brandLogos[i], image: v };
                  update({ ...content, manifesto: { ...man, brandLogos } });
                }}
              />
            </div>
          ))}
        </div>
        <ListField label="Body paragraphs" values={man.paragraphs}
          placeholder="Write a paragraph…"
          onChange={(v) => update({ ...content, manifesto: { ...man, paragraphs: v } })} />
      </SectionAccordion>

      {/* Founders CTA */}
      <SectionAccordion id="foundersCta" label="Founders CTA" selected={selected} onSelect={setSelected}>
        <Field label="Eyebrow" value={fcta.eyebrow}
          onChange={(v) => update({ ...content, foundersCta: { ...fcta, eyebrow: v } })} />
        <Field label="Headline — line 1" value={fcta.headlineLine1}
          onChange={(v) => update({ ...content, foundersCta: { ...fcta, headlineLine1: v } })} />
        <Field label="Headline — line 2 (italic)" value={fcta.headlineLine2}
          onChange={(v) => update({ ...content, foundersCta: { ...fcta, headlineLine2: v } })} />
        <Field label="Body" value={fcta.body} multiline rows={3}
          onChange={(v) => update({ ...content, foundersCta: { ...fcta, body: v } })} />
        <div className="space-y-3">
          <p className="text-eyebrow text-ink/40">Founder preview cards</p>
          {fcta.cards.slice(0, 3).map((card, i) => (
            <div key={i} className="rounded-xl border border-[var(--hairline)] p-3 space-y-2">
              <p className="text-label text-ink/60 font-medium">
                Card {i + 1} — {card.name || "Untitled"}
              </p>
              <Field
                label="Name"
                value={card.name}
                onChange={(v) => {
                  const cards = [...fcta.cards];
                  cards[i] = { ...cards[i], name: v };
                  update({ ...content, foundersCta: { ...fcta, cards } });
                }}
              />
              <Field
                label="LinkedIn URL"
                value={card.linkedin ?? ""}
                onChange={(v) => {
                  const cards = [...fcta.cards];
                  cards[i] = { ...cards[i], linkedin: v };
                  update({ ...content, foundersCta: { ...fcta, cards } });
                }}
              />
              <Field
                label="Email"
                value={card.email ?? ""}
                onChange={(v) => {
                  const cards = [...fcta.cards];
                  cards[i] = { ...cards[i], email: v };
                  update({ ...content, foundersCta: { ...fcta, cards } });
                }}
              />
              <Field
                label="WhatsApp number"
                value={card.whatsapp ?? ""}
                placeholder="+92 300 0000000"
                onChange={(v) => {
                  const cards = [...fcta.cards];
                  cards[i] = { ...cards[i], whatsapp: v };
                  update({ ...content, foundersCta: { ...fcta, cards } });
                }}
              />
              <ImagePickerField
                label="Photo"
                frame="founder-portrait"
                value={card.portrait}
                onChange={(v) => {
                  const cards = [...fcta.cards];
                  cards[i] = { ...cards[i], portrait: v };
                  update({ ...content, foundersCta: { ...fcta, cards } });
                }}
              />
            </div>
          ))}
        </div>
      </SectionAccordion>

      {/* HQ / Studio */}
      <SectionAccordion id="hq" label="HQ / Studio" selected={selected} onSelect={setSelected}>
        <Field label="Eyebrow" value={hq.eyebrow}
          onChange={(v) => update({ ...content, hq: { ...hq, eyebrow: v } })} />
        <Field label="Headline — line 1" value={hq.headlineLine1}
          onChange={(v) => update({ ...content, hq: { ...hq, headlineLine1: v } })} />
        <Field label="Headline — line 2 (italic)" value={hq.headlineLine2}
          onChange={(v) => update({ ...content, hq: { ...hq, headlineLine2: v } })} />
        <Field label="Body" value={hq.body} multiline rows={3}
          onChange={(v) => update({ ...content, hq: { ...hq, body: v } })} />
        <Field label="Address" value={hq.address} multiline rows={3}
          placeholder={"Line 1,\nLine 2,\nCity, Country."}
          onChange={(v) => update({ ...content, hq: { ...hq, address: v } })} />
        <p className="text-body text-ink/55">
          The section displays a rotating branded globe with Pakistan and Kashmir highlighted.
        </p>
      </SectionAccordion>
    </EditorShell>
  );
}
