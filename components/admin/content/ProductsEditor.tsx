"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  PRODUCTS_CONTENT_DEFAULTS,
  parseProductsContent,
  resolveCategoryConfigs,
  type ProductsContent,
  type ProductCard,
  type CategoryConfig,
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
import { CategoryCatalogPanel } from "./CategoryCatalogPanel";

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
          subcategoryId: "",
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

  const categoryConfigs = resolveCategoryConfigs(content);

  const getCategoryConfig = (slug: ProductCategorySlug): CategoryConfig =>
    categoryConfigs.find((item) => item.slug === slug)!;

  const updateCategoryConfig = (slug: ProductCategorySlug, patch: Partial<CategoryConfig>) => {
    const existing = content.categories.find((item) => item.slug === slug);
    const base = existing ?? getCategoryConfig(slug);
    const nextCategories = content.categories.some((item) => item.slug === slug)
      ? content.categories.map((item) => (item.slug === slug ? { ...item, ...patch } : item))
      : [...content.categories, { ...base, ...patch }];
    update({ ...content, categories: nextCategories });
  };

  const updateCatalogItem = (id: string, patch: Partial<ProductCard>) => {
    const catalog = content.catalog.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    update({ ...content, catalog });
  };

  const addProduct = (category: ProductCategorySlug): string => {
    const id = newProductId(category);
    const catalog = [
      ...content.catalog,
      {
        id,
        category,
        title: "New product",
        image: "",
        hoverImage: "",
        subcategoryId: "",
        featured: false,
      },
    ];
    update({ ...content, catalog });
    return id;
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
          Configure category tiles, subcategories, and products in each category section
          below. Homepage section 03 uses the category tile images and subcategories.
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
          frame="hero"
          value={intro.image}
          onChange={(v) => update({ ...content, intro: { ...intro, image: v } })}
        />
      </SectionAccordion>

      {PRODUCT_CATEGORIES.map((category) => {
        const items = content.catalog.filter((item) => item.category === category.slug);
        const config = getCategoryConfig(category.slug);
        return (
          <SectionAccordion
            key={category.slug}
            id={`catalog-${category.slug}`}
            label={category.title}
            selected={selected}
            onSelect={setSelected}
          >
            <CategoryCatalogPanel
              categorySlug={category.slug}
              categoryTitle={category.title}
              categoryConfig={config}
              products={items}
              onUpdateCategory={(patch) => updateCategoryConfig(category.slug, patch)}
              onUpdateProduct={updateCatalogItem}
              onAddProduct={() => addProduct(category.slug)}
              onRemoveProduct={removeProduct}
            />
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
