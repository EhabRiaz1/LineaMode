"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductCategorySlug } from "@/content/product-catalog";
import type { CategoryConfig, ProductCard, Subcategory } from "@/lib/cms/products-schema";
import { sortSubcategories } from "@/lib/cms/products-schema";
import { Field, ImagePickerField } from "./EditorFields";
import { cmsImageSrc } from "@/lib/cms/cms-image";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function newSubcategoryId(category: ProductCategorySlug): string {
  return `${category}-sub-${crypto.randomUUID().slice(0, 8)}`;
}

type CategoryCatalogPanelProps = {
  categorySlug: ProductCategorySlug;
  categoryTitle: string;
  categoryConfig: CategoryConfig;
  products: ProductCard[];
  onUpdateCategory: (patch: Partial<CategoryConfig>) => void;
  onUpdateProduct: (id: string, patch: Partial<ProductCard>) => void;
  onAddProduct: () => string;
  onRemoveProduct: (id: string) => void;
};

export function CategoryCatalogPanel({
  categorySlug,
  categoryTitle,
  categoryConfig,
  products,
  onUpdateCategory,
  onUpdateProduct,
  onAddProduct,
  onRemoveProduct,
}: CategoryCatalogPanelProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const subcategories = sortSubcategories(categoryConfig.subcategories);
  const selectedProduct = products.find((item) => item.id === selectedProductId) ?? null;

  const updateSubcategory = (id: string, patch: Partial<Subcategory>) => {
    const next = categoryConfig.subcategories.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    onUpdateCategory({ subcategories: next });
  };

  const addSubcategory = () => {
    const title = "New subcategory";
    const next: Subcategory = {
      id: newSubcategoryId(categorySlug),
      title,
      slug: slugify(title),
      image: "",
      sortOrder: categoryConfig.subcategories.length,
    };
    onUpdateCategory({ subcategories: [...categoryConfig.subcategories, next] });
  };

  const removeSubcategory = (id: string) => {
    onUpdateCategory({
      subcategories: categoryConfig.subcategories.filter((item) => item.id !== id),
    });
  };

  const moveSubcategory = (id: string, direction: "up" | "down") => {
    const sorted = sortSubcategories(categoryConfig.subcategories);
    const index = sorted.findIndex((item) => item.id === id);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const reordered = [...sorted];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    onUpdateCategory({
      subcategories: reordered.map((item, i) => ({ ...item, sortOrder: i })),
    });
  };

  const handleAddProduct = () => {
    const id = onAddProduct();
    setSelectedProductId(id);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <p className="text-eyebrow text-ink/40">Subcategories</p>
          <p className="text-label text-ink/55 mt-1">
            Define subcategories for {categoryTitle}. These group products on the
            Products page.
          </p>
        </div>

        <div className="space-y-2">
          {subcategories.map((sub, index) => (
            <div
              key={sub.id}
              className="rounded-xl border border-[var(--hairline)] bg-stone/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-eyebrow text-ink/40">
                  {String(index + 1).padStart(2, "0")} / Subcategory
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Move subcategory up"
                    disabled={index === 0}
                    onClick={() => moveSubcategory(sub.id, "up")}
                    className="rounded-lg px-2 py-1 text-label text-ink/45 hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move subcategory down"
                    disabled={index === subcategories.length - 1}
                    onClick={() => moveSubcategory(sub.id, "down")}
                    className="rounded-lg px-2 py-1 text-label text-ink/45 hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSubcategory(sub.id)}
                    className="text-label text-ink/45 hover:text-terracotta px-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <Field
                label="Title"
                value={sub.title}
                onChange={(v) => {
                  updateSubcategory(sub.id, {
                    title: v,
                    slug: sub.slug === slugify(sub.title) ? slugify(v) : sub.slug,
                  });
                }}
              />
              <Field
                label="Slug"
                value={sub.slug}
                onChange={(v) => updateSubcategory(sub.id, { slug: slugify(v) })}
              />
              <ImagePickerField
                label="Tile image (optional)"
                frame="subcategory-tile"
                value={sub.image ?? ""}
                onChange={(v) => updateSubcategory(sub.id, { image: v })}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSubcategory}
          className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
        >
          + Add subcategory
        </button>
      </section>

      <section className="space-y-3 border-t border-[var(--hairline)] pt-6">
        <div>
          <p className="text-eyebrow text-ink/40">Homepage tile image</p>
          <p className="text-label text-ink/55 mt-1">
            Image for the {categoryTitle} tile on the homepage products section. Hover
            headline, text, and button label are edited in{" "}
            <Link href="/admin/content/pages/home" className="underline hover:text-ink">
              Home → 03 / Products
            </Link>
            .
          </p>
        </div>
        <ImagePickerField
          label="Tile image"
          frame="category-tile"
          value={categoryConfig.image}
          onChange={(v) => onUpdateCategory({ image: v })}
        />
      </section>

      <section className="space-y-3 border-t border-[var(--hairline)] pt-6">
        <div>
          <p className="text-eyebrow text-ink/40">Products</p>
          <p className="text-label text-ink/55 mt-1">
            Click a product tile to edit its details.
          </p>
        </div>

        {selectedProduct ? (
          <div className="rounded-xl border border-[var(--hairline)] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedProductId(null)}
                className="text-label text-ink/55 hover:text-ink"
              >
                ← Back to products
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveProduct(selectedProduct.id);
                  setSelectedProductId(null);
                }}
                className="text-label text-ink/45 hover:text-terracotta px-2 shrink-0"
              >
                ✕ Delete
              </button>
            </div>
            <Field
              label="Title"
              value={selectedProduct.title}
              onChange={(v) => onUpdateProduct(selectedProduct.id, { title: v })}
            />
            <ImagePickerField
              label="Photo"
              frame="product-grid"
              value={selectedProduct.image}
              onChange={(v) => onUpdateProduct(selectedProduct.id, { image: v })}
            />
            <ImagePickerField
              label="Hover photo (alternate product)"
              frame="product-hover"
              value={selectedProduct.hoverImage ?? ""}
              onChange={(v) => onUpdateProduct(selectedProduct.id, { hoverImage: v })}
            />
            <label className="block">
              <span className="text-eyebrow text-ink/40 block mb-1">Subcategory</span>
              <select
                value={selectedProduct.subcategoryId ?? ""}
                onChange={(e) =>
                  onUpdateProduct(selectedProduct.id, { subcategoryId: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
              >
                <option value="">Uncategorized</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedProductId(item.id)}
                  className="group overflow-hidden rounded-xl border border-[var(--hairline)] bg-stone text-left transition-colors hover:border-ink/20"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-ink/5">
                    {cmsImageSrc(item.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cmsImageSrc(item.image)}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-label text-ink/35">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-label text-ink/85 line-clamp-2">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddProduct}
              className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
            >
              + Add product
            </button>
          </>
        )}
      </section>
    </div>
  );
}
