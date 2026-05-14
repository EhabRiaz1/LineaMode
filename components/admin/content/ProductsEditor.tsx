"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  PRODUCTS_CONTENT_DEFAULTS, parseProductsContent,
  type ProductsContent, type ProductItem,
} from "@/lib/cms/products-schema";
import { products as staticProducts } from "@/content/products";
import {
  saveProductsContentDraft, publishProductsContent, discardProductsContentDraft,
} from "@/app/admin/(console)/content/_actions";
import { Field, ImagePickerField, ListField, CtaField, SectionAccordion, EditorShell } from "./EditorFields";

export function ProductsEditor() {
  const { token, authHeaders, status } = useAdminSession();
  const [content, setContent] = useState<ProductsContent>(PRODUCTS_CONTENT_DEFAULTS);
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
    const res = await adminFetch<{ published: ProductsContent | null; draft: ProductsContent | null }>(
      "/api/admin/cms/products", { authHeaders: authHeaders() }
    );
    if (res.ok) {
      const parsed = parseProductsContent(res.data.draft ?? res.data.published ?? PRODUCTS_CONTENT_DEFAULTS);
      if (!parsed.products.length) {
        parsed.products = staticProducts.map(p => ({
          title: p.title, tagline: p.tagline, description: p.description,
          highlights: [...p.highlights], hero: p.hero, detail: p.detail,
          moq: "From 200 pcs", leadTime: "45–60 days",
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
      const r = await saveProductsContentDraft(token, content);
      if (r.ok) { setHasDraft(true); setPreviewNonce(n => n + 1); }
      setPreviewSaving(false);
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  const update = useCallback((next: ProductsContent) => { setContent(next); setDirty(true); }, []);

  const updateProduct = (index: number, patch: Partial<ProductItem>) => {
    const prods = [...content.products];
    prods[index] = { ...prods[index], ...patch };
    update({ ...content, products: prods });
  };

  const onSaveDraft = async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true); setError(null);
    const r = await saveProductsContentDraft(token, content);
    setSaving(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(true); setPreviewNonce(n => n + 1);
  };

  const onPublish = async () => {
    if (timer.current) clearTimeout(timer.current);
    setPublishing(true); setError(null);
    if (dirty) { const s = await saveProductsContentDraft(token, content); if (!s.ok) { setError(s.error); setPublishing(false); return; } }
    const r = await publishProductsContent(token);
    setPublishing(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(false); setPreviewNonce(n => n + 1);
  };

  const onDiscard = async () => {
    setDiscarding(true);
    await discardProductsContentDraft(token);
    setDiscarding(false); void load();
  };

  if (loading) return <p className="text-body text-ink/55">Loading editor…</p>;

  const intro = content.intro;
  const cta = content.cta;

  return (
    <EditorShell
      title="Products"
      backHref="/admin/content/pages"
      hasDraft={hasDraft} dirty={dirty} saving={saving} publishing={publishing}
      discarding={discarding} error={error}
      previewSrc="/admin/preview/products" previewSaving={previewSaving}
      previewNonce={previewNonce} liveSiteHref="/products"
      fullPreviewHref="/admin/preview/products"
      onSaveDraft={onSaveDraft} onPublish={onPublish} onDiscard={onDiscard}
    >
      {/* Intro */}
      <SectionAccordion id="intro" label="Intro" selected={selected} onSelect={setSelected}>
        <Field label="Eyebrow" value={intro.eyebrow}
          onChange={(v) => update({ ...content, intro: { ...intro, eyebrow: v } })} />
        <Field label="Headline" value={intro.headline}
          onChange={(v) => update({ ...content, intro: { ...intro, headline: v } })} />
      </SectionAccordion>

      {/* Product blocks */}
      {content.products.map((p, i) => (
        <SectionAccordion
          key={i}
          id={`product-${i}`}
          label={`${String(i + 1).padStart(2, "0")} / ${p.title || `Product ${i + 1}`}`}
          selected={selected} onSelect={setSelected}
        >
          <Field label="Title" value={p.title} onChange={(v) => updateProduct(i, { title: v })} />
          <Field label="Tagline (top-right label)" value={p.tagline}
            onChange={(v) => updateProduct(i, { tagline: v })} />
          <Field label="Description" value={p.description} multiline rows={3}
            onChange={(v) => updateProduct(i, { description: v })} />
          <ImagePickerField label="Hero image" value={p.hero}
            onChange={(v) => updateProduct(i, { hero: v })} />
          <ImagePickerField label="Hover / detail image" value={p.detail}
            onChange={(v) => updateProduct(i, { detail: v })} />
          <ListField label="Highlight tags" values={p.highlights}
            placeholder="e.g. Jersey basics"
            onChange={(v) => updateProduct(i, { highlights: v })} />
          <Field label="MOQ" value={p.moq} placeholder="From 200 pcs"
            onChange={(v) => updateProduct(i, { moq: v })} />
          <Field label="Lead time" value={p.leadTime} placeholder="45–60 days"
            onChange={(v) => updateProduct(i, { leadTime: v })} />
        </SectionAccordion>
      ))}

      {/* CTA */}
      <SectionAccordion id="cta" label="Closing CTA" selected={selected} onSelect={setSelected}>
        <Field label="Headline — line 1" value={cta.headlineLine1}
          onChange={(v) => update({ ...content, cta: { ...cta, headlineLine1: v } })} />
        <Field label="Headline — line 2 (italic)" value={cta.headlineLine2}
          onChange={(v) => update({ ...content, cta: { ...cta, headlineLine2: v } })} />
        <Field label="Body" value={cta.body} multiline rows={3}
          onChange={(v) => update({ ...content, cta: { ...cta, body: v } })} />
        <CtaField label="Primary CTA" value={cta.primaryCta}
          onChange={(v) => update({ ...content, cta: { ...cta, primaryCta: v } })} />
        <CtaField label="Secondary CTA" value={cta.secondaryCta}
          onChange={(v) => update({ ...content, cta: { ...cta, secondaryCta: v } })} />
      </SectionAccordion>
    </EditorShell>
  );
}
