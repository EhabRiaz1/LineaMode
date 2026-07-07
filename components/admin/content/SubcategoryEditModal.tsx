"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Subcategory } from "@/lib/cms/products-schema";
import { Field, ImagePickerField } from "./EditorFields";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function subcategoriesEqual(a: Subcategory, b: Subcategory): boolean {
  return (
    a.title === b.title &&
    a.slug === b.slug &&
    a.image === b.image
  );
}

type SubcategoryEditModalProps = {
  subcategory: Subcategory;
  allSubcategories: Subcategory[];
  isNew?: boolean;
  saving?: boolean;
  onDone: (subcategory: Subcategory) => void;
  onDelete?: () => void;
  onClose: () => void;
  onCancelNew?: () => void;
};

export function SubcategoryEditModal({
  subcategory,
  allSubcategories,
  isNew = false,
  saving = false,
  onDone,
  onDelete,
  onClose,
  onCancelNew,
}: SubcategoryEditModalProps) {
  const [draft, setDraft] = useState<Subcategory>(subcategory);
  const dirty = !subcategoriesEqual(draft, subcategory);
  const [slugTouched, setSlugTouched] = useState(
    subcategory.slug !== slugify(subcategory.title),
  );

  useEffect(() => {
    setDraft(subcategory);
    setSlugTouched(subcategory.slug !== slugify(subcategory.title));
  }, [subcategory]);

  const duplicateTitle = useMemo(() => {
    const normalized = draft.title.trim().toLowerCase();
    if (!normalized) return false;
    return allSubcategories.some(
      (item) => item.id !== draft.id && item.title.trim().toLowerCase() === normalized,
    );
  }, [allSubcategories, draft.id, draft.title]);

  const requestClose = useCallback(() => {
    if (!dirty) {
      if (isNew && draft.title === "New subcategory") {
        onCancelNew?.();
      }
      onClose();
      return;
    }

    const message = isNew
      ? "Discard this new subcategory?"
      : `Discard changes to "${subcategory.title}"?`;
    if (window.confirm(message)) {
      if (isNew) onCancelNew?.();
      onClose();
    }
  }, [dirty, draft.title, isNew, onCancelNew, onClose, subcategory.title]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  const handleDelete = () => {
    if (
      !onDelete ||
      !window.confirm(
        `Delete "${draft.title}"? Products in this group will become uncategorized.`,
      )
    ) {
      return;
    }
    onDelete();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subcategory-edit-title"
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
          <p id="subcategory-edit-title" className="text-body font-medium text-ink">
            {isNew ? "New subcategory" : `Edit ${subcategory.title}`}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {duplicateTitle && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-label text-yellow-700">
              Another subcategory already uses this name. They will remain separate groups.
            </div>
          )}
          <Field
            label="Title"
            value={draft.title}
            onChange={(v) =>
              setDraft({
                ...draft,
                title: v,
                slug: slugTouched ? draft.slug : slugify(v),
              })
            }
          />
          <Field
            label="Slug"
            value={draft.slug}
            onChange={(v) => {
              setSlugTouched(true);
              setDraft({ ...draft, slug: slugify(v) });
            }}
          />
          <ImagePickerField
            label="Tile image (optional)"
            frame="subcategory-tile"
            value={draft.image ?? ""}
            onChange={(v) => setDraft({ ...draft, image: v })}
            overlayZIndex="z-[90]"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] bg-stone/95 px-5 py-4 backdrop-blur-sm">
          {!isNew && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-label text-terracotta hover:underline"
            >
              Delete subcategory
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
