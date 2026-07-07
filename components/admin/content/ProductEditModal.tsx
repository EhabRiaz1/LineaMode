"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductCard, Subcategory } from "@/lib/cms/products-schema";
import { Field, ImagePickerField } from "./EditorFields";

function productsEqual(a: ProductCard, b: ProductCard): boolean {
  return (
    a.title === b.title &&
    a.image === b.image &&
    a.subcategoryId === b.subcategoryId
  );
}

function isDefaultNewProduct(product: ProductCard): boolean {
  return product.title === "New product" && !product.image;
}

type ProductEditModalProps = {
  product: ProductCard;
  subcategories: Subcategory[];
  isNew?: boolean;
  saving?: boolean;
  onDone: (product: ProductCard) => void;
  onDelete: () => void;
  onClose: () => void;
  onCancelNew?: () => void;
};

export function ProductEditModal({
  product,
  subcategories,
  isNew = false,
  saving = false,
  onDone,
  onDelete,
  onClose,
  onCancelNew,
}: ProductEditModalProps) {
  const [draft, setDraft] = useState<ProductCard>(product);
  const dirty = !productsEqual(draft, product);

  useEffect(() => {
    setDraft(product);
  }, [product]);

  const requestClose = useCallback(() => {
    if (!dirty) {
      if (isNew && isDefaultNewProduct(draft)) {
        onCancelNew?.();
      }
      onClose();
      return;
    }

    const message = isNew
      ? "Discard this new product?"
      : `Discard changes to "${product.title}"?`;
    if (window.confirm(message)) {
      if (isNew) onCancelNew?.();
      onClose();
    }
  }, [dirty, draft, isNew, onCancelNew, onClose, product.title]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  const handleDelete = () => {
    const label = draft.title.trim() || "this product";
    if (
      window.confirm(
        `Delete "${label}"? It will be removed from the draft until you discard.`,
      )
    ) {
      onDelete();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-edit-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
        onClick={requestClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--hairline)] bg-stone shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[var(--hairline)] px-5 py-4">
          <p id="product-edit-title" className="text-body font-medium text-ink">
            {isNew ? "New product" : `Edit ${product.title}`}
          </p>
          <p className="mt-1 text-label text-ink/55">
            Done saves to draft. Publish when ready for the live site.
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <Field
            label="Title"
            value={draft.title}
            onChange={(v) => setDraft({ ...draft, title: v })}
          />
          <ImagePickerField
            label="Photo"
            frame="product-grid"
            value={draft.image}
            onChange={(v) => setDraft({ ...draft, image: v })}
            overlayZIndex="z-[90]"
          />
          <p className="text-label text-ink/45">
            On hover, visitors see the lookbook CTA configured in the Lookbook hover section.
          </p>
          <label className="block">
            <span className="text-eyebrow text-ink/40 mb-1 block">Subcategory</span>
            <select
              value={draft.subcategoryId ?? ""}
              onChange={(e) => setDraft({ ...draft, subcategoryId: e.target.value })}
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

        <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] bg-stone/95 px-5 py-4 backdrop-blur-sm">
          {!isNew ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-label text-terracotta hover:underline"
            >
              Delete product
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestClose}
              className="rounded-full border border-[var(--hairline)] px-5 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                onDone(draft);
                onClose();
              }}
              className="rounded-full bg-ink px-5 py-2 text-label text-stone hover:bg-ink/85 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
