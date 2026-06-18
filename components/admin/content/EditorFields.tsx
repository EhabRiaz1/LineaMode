"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  cmsImageSrc,
  isDefaultMobileFocus,
  parseCmsImage,
  serializeCmsImage,
  type CmsImageValue,
  type ImageFramePreset,
} from "@/lib/cms/cms-image";
import { FocalPointModal } from "./FocalPointModal";
import { MediaPicker, type MediaItem } from "./MediaPicker";
import { PreviewPanel } from "./PreviewPanel";

// ─── Text field ──────────────────────────────────────────────────────────────

export function Field({
  label,
  value,
  onChange,
  multiline,
  rows,
  placeholder,
  disabled,
  inputClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
}) {
  const baseClass =
    "w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15 disabled:opacity-50 disabled:bg-ink/[0.02]";
  return (
    <label className="block">
      <span className="text-eyebrow text-ink/40 block mb-1">{label}</span>
      {multiline ? (
        <textarea
          rows={rows ?? 3}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseClass, "resize-y", inputClassName)}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseClass, inputClassName)}
        />
      )}
    </label>
  );
}

// ─── List field (array of strings) ──────────────────────────────────────────

export function ListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>
      {values.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={val}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="text-label text-ink/45 hover:text-terracotta px-2 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
      >
        + Add
      </button>
    </div>
  );
}

// ─── CTA field ───────────────────────────────────────────────────────────────

export function CtaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { label: string; href: string };
  onChange: (v: { label: string; href: string }) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--hairline)] p-3 space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>
      <Field
        label="Button label"
        value={value.label}
        onChange={(v) => onChange({ ...value, label: v })}
      />
      <Field
        label="Link URL"
        value={value.href}
        onChange={(v) => onChange({ ...value, href: v })}
      />
    </div>
  );
}

// ─── Image picker field ───────────────────────────────────────────────────────
// Shows:
//   1. A thumbnail preview of the current image (if any)
//   2. "Pick from library" → opens the MediaPicker modal (sets URL)
//   3. The existing URL text input beneath — kept as a fallback so
//      any already-saved external URL (Unsplash, etc.) is never lost.

export function ImagePickerField({
  label,
  value,
  onChange,
  placeholder,
  frame = "video",
}: {
  label: string;
  value: CmsImageValue;
  onChange: (value: CmsImageValue) => void;
  placeholder?: string;
  frame?: ImageFramePreset;
}) {
  const [picking, setPicking] = useState(false);
  const [positioning, setPositioning] = useState(false);
  const parsed = parseCmsImage(value);
  const src = parsed.src;
  const hasCustomFocus = !isDefaultMobileFocus(parsed.mobileFocus);

  const updateSrc = (nextSrc: string) => {
    onChange(serializeCmsImage({ src: nextSrc, mobileFocus: parsed.mobileFocus }));
  };

  const updateFocus = (mobileFocus: typeof parsed.mobileFocus) => {
    onChange(serializeCmsImage({ src: parsed.src, mobileFocus }));
  };

  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>

      <div className="rounded-2xl border border-[var(--hairline)] bg-stone p-3 space-y-3">
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="w-full aspect-video object-cover rounded-xl bg-ink/5"
          />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
          >
            {src ? "Change image" : "Pick from library"}
          </button>
          {src && (
            <>
              <button
                type="button"
                onClick={() => setPositioning(true)}
                className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
              >
                {hasCustomFocus ? "Edit phone position" : "Position for phone"}
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-label text-ink/45 hover:text-terracotta transition-colors"
              >
                Remove
              </button>
            </>
          )}
        </div>

        {hasCustomFocus && (
          <p className="text-label text-ink/45">
            Phone focus set · {parsed.mobileFocus.x}% × {parsed.mobileFocus.y}%
          </p>
        )}

        <div>
          <p className="text-eyebrow text-ink/35 mb-1">Or paste a URL</p>
          <input
            value={src}
            placeholder={placeholder ?? "https://…"}
            onChange={(e) => updateSrc(e.target.value)}
            className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-label text-ink outline-none focus:ring-2 focus:ring-ink/15"
          />
        </div>
      </div>

      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(media: MediaItem) => {
            updateSrc(media.url);
            setPicking(false);
          }}
        />
      )}

      {positioning && src && (
        <FocalPointModal
          src={src}
          focus={parsed.mobileFocus}
          frame={frame}
          onSave={(mobileFocus) => {
            updateFocus(mobileFocus);
            setPositioning(false);
          }}
          onClose={() => setPositioning(false)}
        />
      )}
    </div>
  );
}

export type HeroMediaMode = "image" | "video";

export function MediaModeToggle({
  value,
  onChange,
}: {
  value: HeroMediaMode;
  onChange: (mode: HeroMediaMode) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">Background</p>
      <div className="inline-flex rounded-full border border-[var(--hairline)] bg-stone p-1">
        {(
          [
            { mode: "image" as const, label: "Photo" },
            { mode: "video" as const, label: "Video" },
          ] as const
        ).map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "rounded-full px-4 py-1.5 text-label transition-colors",
              value === mode ? "bg-ink text-stone" : "text-ink/65 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-label text-ink/45">
        Only the selected background type is shown on the live page.
      </p>
    </div>
  );
}

export function VideoPickerField({
  label,
  value,
  onChange,
  placeholder,
  frame = "hero",
}: {
  label: string;
  value: CmsImageValue;
  onChange: (value: CmsImageValue) => void;
  placeholder?: string;
  frame?: ImageFramePreset;
}) {
  const [picking, setPicking] = useState(false);
  const [positioning, setPositioning] = useState(false);
  const parsed = parseCmsImage(value);
  const src = parsed.src;
  const hasCustomFocus = !isDefaultMobileFocus(parsed.mobileFocus);

  const updateSrc = (nextSrc: string) => {
    onChange(serializeCmsImage({ src: nextSrc, mobileFocus: parsed.mobileFocus }));
  };

  const updateFocus = (mobileFocus: typeof parsed.mobileFocus) => {
    onChange(serializeCmsImage({ src: parsed.src, mobileFocus }));
  };

  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>

      <div className="rounded-2xl border border-[var(--hairline)] bg-stone p-3 space-y-3">
        {src && (
          <video
            src={src}
            className="w-full aspect-video object-cover rounded-xl bg-ink/5"
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
          />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
          >
            {src ? "Change video" : "Pick from library"}
          </button>
          {src && (
            <>
              <button
                type="button"
                onClick={() => setPositioning(true)}
                className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
              >
                {hasCustomFocus ? "Edit phone position" : "Position for phone"}
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-label text-ink/45 hover:text-terracotta transition-colors"
              >
                Remove
              </button>
            </>
          )}
        </div>

        {hasCustomFocus && (
          <p className="text-label text-ink/45">
            Phone focus set · {parsed.mobileFocus.x}% × {parsed.mobileFocus.y}%
          </p>
        )}

        <div>
          <p className="text-eyebrow text-ink/35 mb-1">Or paste a URL</p>
          <input
            value={src}
            placeholder={placeholder ?? "https://…/video.mp4"}
            onChange={(e) => updateSrc(e.target.value)}
            className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-label text-ink outline-none focus:ring-2 focus:ring-ink/15"
          />
        </div>
      </div>

      {picking && (
        <MediaPicker
          mediaFilter="video"
          onClose={() => setPicking(false)}
          onPick={(media: MediaItem) => {
            updateSrc(media.url);
            setPicking(false);
          }}
        />
      )}

      {positioning && src && (
        <FocalPointModal
          src={src}
          kind="video"
          focus={parsed.mobileFocus}
          frame={frame}
          onSave={(mobileFocus) => {
            updateFocus(mobileFocus);
            setPositioning(false);
          }}
          onClose={() => setPositioning(false)}
        />
      )}
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={cn("w-10 h-6 rounded-full transition-colors", checked ? "bg-ink" : "bg-ink/20")} />
        <div
          className={cn(
            "absolute top-1 left-1 size-4 rounded-full bg-stone transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </div>
      <div>
        <p className="text-body text-ink">{label}</p>
        {description && <p className="text-label text-ink/55">{description}</p>}
      </div>
    </label>
  );
}

// ─── Section accordion ───────────────────────────────────────────────────────

export function SectionAccordion({
  id,
  label,
  selected,
  onSelect,
  enabled,
  children,
}: {
  id: string;
  label: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  enabled?: boolean;
  children: React.ReactNode;
}) {
  const open = selected === id;
  return (
    <details
      open={open}
      onToggle={(e) => {
        if ((e.target as HTMLDetailsElement).open) onSelect(id);
        else if (open) onSelect(null);
      }}
      className="group rounded-2xl border border-[var(--hairline)] bg-stone overflow-hidden"
    >
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-ink/[0.02] transition-colors list-none">
        <span className="text-body text-ink font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {enabled === false && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink/8 text-ink/50 uppercase tracking-widest">
              off
            </span>
          )}
          <span className="text-ink/35 group-open:rotate-180 transition-transform">▼</span>
        </div>
      </summary>
      <div className="px-5 pb-5 pt-2 border-t border-[var(--hairline)] space-y-4">{children}</div>
    </details>
  );
}

// ─── Editor shell (header + two-column layout) ───────────────────────────────

export function EditorShell({
  title,
  subtitle,
  backHref,
  hasDraft,
  dirty,
  saving,
  publishing,
  discarding,
  error,
  previewSrc,
  previewSaving,
  previewNonce,
  liveSiteHref,
  fullPreviewHref,
  onSaveDraft,
  onPublish,
  onDiscard,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  hasDraft: boolean;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  discarding: boolean;
  error: string | null;
  previewSrc: string;
  previewSaving: boolean;
  previewNonce: number;
  liveSiteHref: string;
  fullPreviewHref: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="space-y-1">
          <a href={backHref} className="text-label text-ink/55 hover:text-ink">
            ← All pages
          </a>
          <h1 className="text-h2 text-ink">{title}</h1>
          <p className="text-label text-ink/55">
            {hasDraft ? "Draft pending · " : ""}
            {subtitle ?? "Changes auto-save and refresh the preview."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {dirty && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
              Unsaved changes
            </span>
          )}
          {hasDraft && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={discarding}
              className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/65 hover:bg-ink/5 transition-colors disabled:opacity-60"
            >
              {discarding ? "Discarding…" : "Discard draft"}
            </button>
          )}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving || publishing || !dirty}
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || saving}
            className="rounded-full bg-ink text-stone px-5 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        <div className="space-y-3">
          <p className="text-eyebrow text-ink/45">Page sections</p>
          {children}
        </div>

        <PreviewPanel
          subtitle={previewSaving ? "Refreshing…" : "Auto-refreshes after each edit"}
          previewSrc={previewSrc}
          previewNonce={previewNonce}
          previewSaving={previewSaving}
          iframeTitle="Draft preview"
          actions={
            <>
              <a
                href={fullPreviewHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
              >
                Full preview ↗
              </a>
              <a
                href={liveSiteHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-ink px-4 py-1.5 text-label text-stone hover:bg-ink/85 transition-colors"
              >
                Live site →
              </a>
            </>
          }
        />
      </div>
    </div>
  );
}
