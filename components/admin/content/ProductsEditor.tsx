"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  PRODUCTS_CONTENT_DEFAULTS,
  parseProductsContent,
  type ProductsContent,
  type ProductCard,
} from "@/lib/cms/products-schema";
import {
  PRODUCT_CATEGORIES,
  SEED_PRODUCT_CATALOG,
  type ProductCategorySlug,
} from "@/content/product-catalog";
import {
  saveProductsContentDraft,
  publishProductsContent,
  discardProductsContentDraft,
} from "@/app/admin/(console)/content/_actions";
import {
  Field,
  ImagePickerField,
  CtaField,
  SectionAccordion,
  EditorShell,
} from "./EditorFields";

function newProductId(category: ProductCategorySlug): string {
  return `${category}-${crypto.randomUUID().slice(0, 8)}`;
}

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
      "/api/admin/cms/products",
      { authHeaders: authHeaders() },
    );
    if (res.ok) {
      const parsed = parseProductsContent(res.data.draft ?? res.data.published ?? PRODUCTS_CONTENT_DEFAULTS);
      if (!parsed.catalog.length) {
        parsed.catalog = SEED_PRODUCT_CATALOG.map((item) => ({
          ...item,
          featured: item.featured ?? false,
        }));
      }
      setContent(parsed);
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
      const r = await saveProductsContentDraft(token, content);
      if (r.ok) {
        setHasDraft(true);
        setPreviewNonce((n) => n + 1);
      }
      setPreviewSaving(false);
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  const update = useCallback((next: ProductsContent) => {
    setContent(next);
    setDirty(true);
  }, []);

  const updateCatalogItem = (id: string, patch: Partial<ProductCard>) => {
    const catalog = content.catalog.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    update({ ...content, catalog });
  };

  const addProduct = (category: ProductCategorySlug) => {
    const catalog = [
      ...content.catalog,
      {
        id: newProductId(category),
        category,
        title: "New product",
        image: "",
        hoverImage: "",
        featured: false,
      },
    ];
    update({ ...content, catalog });
  };

  const removeProduct = (id: string) => {
    update({ ...content, catalog: content.catalog.filter((item) => item.id !== id) });
  };

  const onSaveDraft = async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true);
    setError(null);
    const r = await saveProductsContentDraft(token, content);
    setSaving(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setDirty(false);
    setHasDraft(true);
    setPreviewNonce((n) => n + 1);
  };

  const onPublish = async () => {
    if (timer.current) clearTimeout(timer.current);
    setPublishing(true);
    setError(null);
    if (dirty) {
      const s = await saveProductsContentDraft(token, content);
      if (!s.ok) {
        setError(s.error);
        setPublishing(false);
        return;
      }
    }
    const r = await publishProductsContent(token);
    setPublishing(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setDirty(false);
    setHasDraft(false);
    setPreviewNonce((n) => n + 1);
  };

  const onDiscard = async () => {
    setDiscarding(true);
    await discardProductsContentDraft(token);
    setDiscarding(false);
    void load();
  };

  if (loading) return <p className="text-body text-ink/55">Loading editor…</p>;

  const intro = content.intro;
  const cta = content.cta;

  return (
    <EditorShell
      title="Products"
      backHref="/admin/content/pages"
      hasDraft={hasDraft}
      dirty={dirty}
      saving={saving}
      publishing={publishing}
      discarding={discarding}
      error={error}
      previewSrc="/admin/preview/products"
      previewSaving={previewSaving}
      previewNonce={previewNonce}
      liveSiteHref="/products"
      fullPreviewHref="/admin/preview/products"
      onSaveDraft={onSaveDraft}
      onPublish={onPublish}
      onDiscard={onDiscard}
    >
      <SectionAccordion id="intro" label="Intro" selected={selected} onSelect={setSelected}>
        <p className="text-label text-ink/55">
          Toggle &ldquo;Featured on homepage&rdquo; on any product below to show it
          in the homepage product rail.
        </p>
        <Field
          label="Eyebrow"
          value={intro.eyebrow}
          onChange={(v) => update({ ...content, intro: { ...intro, eyebrow: v } })}
        />
        <Field
          label="Headline"
          value={intro.headline}
          onChange={(v) => update({ ...content, intro: { ...intro, headline: v } })}
        />
        <ImagePickerField
          label="Hero image"
          value={intro.image}
          onChange={(v) => update({ ...content, intro: { ...intro, image: v } })}
        />
      </SectionAccordion>

      {PRODUCT_CATEGORIES.map((category) => {
        const items = content.catalog.filter((item) => item.category === category.slug);
        return (
          <SectionAccordion
            key={category.slug}
            id={`catalog-${category.slug}`}
            label={category.title}
            selected={selected}
            onSelect={setSelected}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--hairline)] p-3 space-y-2 mb-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-eyebrow text-ink/40">
                    {String(i + 1).padStart(2, "0")} / Product
                  </p>
                  <button
                    type="button"
                    onClick={() => removeProduct(item.id)}
                    className="text-label text-ink/45 hover:text-terracotta px-2 shrink-0"
                  >
                    ✕ Delete
                  </button>
                </div>
                <Field
                  label="Title"
                  value={item.title}
                  onChange={(v) => updateCatalogItem(item.id, { title: v })}
                />
                <ImagePickerField
                  label="Photo"
                  value={item.image}
                  onChange={(v) => updateCatalogItem(item.id, { image: v })}
                />
                <ImagePickerField
                  label="Hover photo (alternate product)"
                  value={item.hoverImage ?? ""}
                  onChange={(v) => updateCatalogItem(item.id, { hoverImage: v })}
                />
                <label className="flex items-center gap-2.5 rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!item.featured}
                    onChange={(e) =>
                      updateCatalogItem(item.id, { featured: e.target.checked })
                    }
                    className="size-4 rounded border-[var(--hairline)] accent-ink"
                  />
                  <span className="text-label text-ink/85">Featured on homepage</span>
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addProduct(category.slug)}
              className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
            >
              + Add product
            </button>
          </SectionAccordion>
        );
      })}

      <SectionAccordion id="cta" label="Closing CTA" selected={selected} onSelect={setSelected}>
        <Field
          label="Headline — line 1"
          value={cta.headlineLine1}
          onChange={(v) => update({ ...content, cta: { ...cta, headlineLine1: v } })}
        />
        <Field
          label="Headline — line 2 (italic)"
          value={cta.headlineLine2}
          onChange={(v) => update({ ...content, cta: { ...cta, headlineLine2: v } })}
        />
        <Field
          label="Body"
          value={cta.body}
          multiline
          rows={3}
          onChange={(v) => update({ ...content, cta: { ...cta, body: v } })}
        />
        <CtaField
          label="Contact CTA"
          value={cta.contactCta}
          onChange={(v) => update({ ...content, cta: { ...cta, contactCta: v } })}
        />
      </SectionAccordion>
    </EditorShell>
  );
}
