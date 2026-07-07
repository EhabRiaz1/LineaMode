"use client";

import { useMemo, useState } from "react";
import type { ProductCategorySlug } from "@/content/product-catalog";
import type { CategoryConfig, ProductCard, Subcategory } from "@/lib/cms/products-schema";
import { sortSubcategories } from "@/lib/cms/products-schema";
import { cmsImageSrc } from "@/lib/cms/cms-image";
import { ProductEditModal } from "./ProductEditModal";
import { SubcategoryEditModal } from "./SubcategoryEditModal";

function newSubcategoryId(category: ProductCategorySlug): string {
  return `${category}-sub-${crypto.randomUUID().slice(0, 8)}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ProductGroup = {
  subcategory: Subcategory | null;
  products: ProductCard[];
};

function buildAdminProductGroups(
  products: ProductCard[],
  subcategories: Subcategory[],
): ProductGroup[] {
  const sorted = sortSubcategories(subcategories);
  const groups: ProductGroup[] = sorted.map((subcategory) => ({
    subcategory,
    products: products.filter((item) => item.subcategoryId === subcategory.id),
  }));

  const uncategorized = products.filter(
    (item) =>
      !item.subcategoryId || !sorted.some((sub) => sub.id === item.subcategoryId),
  );
  if (uncategorized.length > 0) {
    groups.push({ subcategory: null, products: uncategorized });
  }

  return groups;
}

type CategoryCatalogPanelProps = {
  categorySlug: ProductCategorySlug;
  categoryTitle: string;
  categoryConfig: CategoryConfig;
  products: ProductCard[];
  saving?: boolean;
  onUpdateCategory: (patch: Partial<CategoryConfig>) => void;
  onUpdateProduct: (id: string, patch: Partial<ProductCard>) => void;
  onAddProduct: (subcategoryId: string) => string;
  onRemoveProduct: (id: string) => void;
};

export function CategoryCatalogPanel({
  categorySlug,
  categoryTitle,
  categoryConfig,
  products,
  saving = false,
  onUpdateCategory,
  onUpdateProduct,
  onAddProduct,
  onRemoveProduct,
}: CategoryCatalogPanelProps) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [isNewSubcategory, setIsNewSubcategory] = useState(false);

  const subcategories = sortSubcategories(categoryConfig.subcategories);
  const groups = useMemo(
    () => buildAdminProductGroups(products, subcategories),
    [products, subcategories],
  );

  const editingProduct = products.find((item) => item.id === editingProductId) ?? null;
  const editingSubcategory =
    subcategories.find((item) => item.id === editingSubcategoryId) ?? null;

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
    setEditingSubcategoryId(next.id);
    setIsNewSubcategory(true);
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

  const openNewProduct = (subcategoryId: string) => {
    const id = onAddProduct(subcategoryId);
    setEditingProductId(id);
    setIsNewProduct(true);
  };

  const closeProductModal = () => {
    setEditingProductId(null);
    setIsNewProduct(false);
  };

  const closeSubcategoryModal = () => {
    setEditingSubcategoryId(null);
    setIsNewSubcategory(false);
  };

  return (
    <div className="space-y-6">
      <p className="text-label text-ink/55">
        Subcategories group products on the /products page. Create a subcategory, then add
        products underneath it. Homepage category tile images are edited in{" "}
        <span className="text-ink/75">Home → 03 / Products</span>.
      </p>

      {groups.map((group) => {
        const sub = group.subcategory;
        const groupKey = sub?.id ?? "uncategorized";
        const subIndex = sub ? subcategories.findIndex((item) => item.id === sub.id) : -1;

        return (
          <section
            key={groupKey}
            className="space-y-3 rounded-xl border border-[var(--hairline)] bg-stone/50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-body font-medium text-ink">
                {sub ? sub.title : "Uncategorized"}
              </p>
              {sub && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Move subcategory up"
                    disabled={subIndex <= 0}
                    onClick={() => moveSubcategory(sub.id, "up")}
                    className="rounded-lg px-2 py-1 text-label text-ink/45 hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move subcategory down"
                    disabled={subIndex < 0 || subIndex >= subcategories.length - 1}
                    onClick={() => moveSubcategory(sub.id, "down")}
                    className="rounded-lg px-2 py-1 text-label text-ink/45 hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubcategoryId(sub.id);
                      setIsNewSubcategory(false);
                    }}
                    className="rounded-lg px-2 py-1 text-label text-ink/55 hover:text-ink"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.products.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setEditingProductId(item.id);
                    setIsNewProduct(false);
                  }}
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

              {sub && (
                <button
                  type="button"
                  onClick={() => openNewProduct(sub.id)}
                  className="group/add overflow-hidden rounded-xl border border-dashed border-[var(--hairline)] bg-stone/80 text-left transition-colors hover:border-ink hover:bg-ink"
                >
                  <div className="flex aspect-[4/5] items-center justify-center text-label text-ink/55 transition-colors group-hover/add:text-stone">
                    + Add product
                  </div>
                  <div className="px-2.5 py-2" aria-hidden>
                    <p className="text-label line-clamp-2 invisible">New product</p>
                  </div>
                </button>
              )}
            </div>
          </section>
        );
      })}

      {subcategories.length === 0 && (
        <p className="text-label text-ink/45">
          No subcategories yet. Add one below to start grouping {categoryTitle} products.
        </p>
      )}

      <button
        type="button"
        onClick={addSubcategory}
        className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
      >
        + Add subcategory
      </button>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          subcategories={subcategories}
          isNew={isNewProduct}
          saving={saving}
          onDone={(next) => onUpdateProduct(editingProduct.id, next)}
          onDelete={() => onRemoveProduct(editingProduct.id)}
          onClose={closeProductModal}
          onCancelNew={() => onRemoveProduct(editingProduct.id)}
        />
      )}

      {editingSubcategory && (
        <SubcategoryEditModal
          subcategory={editingSubcategory}
          allSubcategories={subcategories}
          isNew={isNewSubcategory}
          saving={saving}
          onDone={(next) => updateSubcategory(editingSubcategory.id, next)}
          onDelete={() => removeSubcategory(editingSubcategory.id)}
          onClose={closeSubcategoryModal}
          onCancelNew={() => removeSubcategory(editingSubcategory.id)}
        />
      )}
    </div>
  );
}
