"use client";

import { useState } from "react";
import type { Block, MediaRef, Cta } from "@/lib/cms/blocks";
import {
  DEFAULT_MOBILE_FOCUS,
  type ImageFramePreset,
} from "@/lib/cms/cms-image";
import { MediaPicker } from "./MediaPicker";
import { FocalPointModal } from "./FocalPointModal";
import { MediaModeToggle, VideoPickerField } from "./EditorFields";

/**
 * Per-block field editor. Each branch of the discriminated union maps a
 * block.type to its bespoke form. Inputs are uncontrolled-feeling but
 * controlled — every keystroke pushes the new block up to the parent.
 */
export function BlockFields({
  block,
  onChange,
}: {
  block: Block;
  onChange: (next: Block) => void;
}) {
  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <MediaModeToggle
            value={block.mediaMode ?? "image"}
            onChange={(mode) =>
              onChange({
                ...block,
                mediaMode: mode,
                ...(mode === "image" ? { video: "" } : { image: { src: "" } }),
              })
            }
          />
          {(block.mediaMode ?? "image") === "video" ? (
            <VideoPickerField
              label="Background video"
              frame="hero"
              value={block.video ?? ""}
              onChange={(video) => onChange({ ...block, video })}
            />
          ) : (
            <MediaInput
              label="Background photo"
              frame="hero"
              value={block.image}
              onChange={(image) => onChange({ ...block, image })}
            />
          )}
          <Text label="Eyebrow" value={block.eyebrow} onChange={(v) => onChange({ ...block, eyebrow: v })} />
          <Text label="Headline" value={block.headline} multiline onChange={(v) => onChange({ ...block, headline: v })} />
          <ListInput
            label="Sublines"
            values={block.sublines}
            onChange={(sublines) => onChange({ ...block, sublines })}
            placeholder="Optional supporting line"
          />
          <CtasInput
            label="Calls to action"
            values={block.ctas}
            onChange={(ctas) => onChange({ ...block, ctas })}
          />
        </div>
      );
    case "editorial_split":
      return (
        <div className="space-y-4">
          <Select
            label="Image side"
            value={block.align}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
            onChange={(value) => onChange({ ...block, align: value as "left" | "right" })}
          />
          <MediaInput
            label="Image"
            frame="editorial-split"
            value={block.image}
            onChange={(image) => onChange({ ...block, image })}
          />
          <Text label="Eyebrow" value={block.eyebrow} onChange={(v) => onChange({ ...block, eyebrow: v })} />
          <Text label="Title" value={block.title} multiline onChange={(v) => onChange({ ...block, title: v })} />
          <Text label="Body" value={block.body} multiline rows={5} onChange={(v) => onChange({ ...block, body: v })} />
          <CtaInput
            label="Optional CTA"
            value={block.cta ?? null}
            onChange={(cta) => onChange({ ...block, cta: cta ?? undefined })}
          />
        </div>
      );
    case "capabilities":
      return (
        <div className="space-y-4">
          <Text label="Eyebrow" value={block.eyebrow} onChange={(v) => onChange({ ...block, eyebrow: v })} />
          <Text label="Headline" value={block.headline} onChange={(v) => onChange({ ...block, headline: v })} />
          <p className="text-label text-ink/55">
            The capabilities rail renders the studio's seven-card matrix from
            content/capabilities.ts. Future iterations will let you reorder
            and toggle them from here.
          </p>
        </div>
      );
    case "lookbook_teaser":
      return (
        <div className="space-y-4">
          <MediaInput
            label="Background image"
            frame="lookbook"
            value={block.image}
            onChange={(image) => onChange({ ...block, image })}
          />
          <Text label="Eyebrow" value={block.eyebrow} onChange={(v) => onChange({ ...block, eyebrow: v })} />
          <Text label="Title" value={block.title} multiline onChange={(v) => onChange({ ...block, title: v })} />
          <Text label="Body" value={block.body} multiline onChange={(v) => onChange({ ...block, body: v })} />
          <CtaInput
            label="CTA"
            value={block.cta}
            onChange={(cta) =>
              onChange({ ...block, cta: cta ?? { label: "", href: "", variant: "ink" } })
            }
          />
        </div>
      );
    case "journal_grid":
      return (
        <div className="space-y-4">
          <Text label="Eyebrow" value={block.eyebrow} onChange={(v) => onChange({ ...block, eyebrow: v })} />
          <Text label="Headline" value={block.headline} onChange={(v) => onChange({ ...block, headline: v })} />
          <Number
            label="Limit"
            value={block.limit}
            min={1}
            max={12}
            onChange={(value) => onChange({ ...block, limit: value })}
          />
        </div>
      );
    case "gallery":
      return (
        <div className="space-y-4">
          <Text
            label="Eyebrow"
            value={block.eyebrow ?? ""}
            onChange={(v) => onChange({ ...block, eyebrow: v || undefined })}
          />
          <p className="text-eyebrow text-ink/40">Images</p>
          <div className="space-y-3">
            {block.images.map((image, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[var(--hairline)] bg-stone p-3 space-y-2"
              >
                <MediaInput
                  label={`Image ${index + 1}`}
                  frame="gallery"
                  value={image}
                  onChange={(next) => {
                    const list = [...block.images];
                    list[index] = next;
                    onChange({ ...block, images: list });
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const list = block.images.filter((_, i) => i !== index);
                    onChange({ ...block, images: list.length ? list : [{ src: "" }] });
                  }}
                  className="text-label text-ink/45 hover:text-terracotta"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...block, images: [...block.images, { src: "" }] })}
              className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
            >
              + Add image
            </button>
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="space-y-4">
          <Text label="Eyebrow" value={block.eyebrow} onChange={(v) => onChange({ ...block, eyebrow: v })} />
          <Text label="Headline" value={block.headline} multiline onChange={(v) => onChange({ ...block, headline: v })} />
          <Text label="Body" value={block.body ?? ""} multiline onChange={(v) => onChange({ ...block, body: v || undefined })} />
          <CtaInput
            label="CTA"
            value={block.cta}
            onChange={(cta) =>
              onChange({ ...block, cta: cta ?? { label: "", href: "", variant: "ink" } })
            }
          />
        </div>
      );
    case "quote":
      return (
        <div className="space-y-4">
          <Text label="Quote" value={block.text} multiline rows={4} onChange={(v) => onChange({ ...block, text: v })} />
          <Text label="Attribution" value={block.attribution} onChange={(v) => onChange({ ...block, attribution: v })} />
        </div>
      );
    case "rich_text":
      return (
        <Text
          label="Body"
          value={block.body}
          multiline
          rows={12}
          onChange={(v) => onChange({ ...block, body: v })}
        />
      );
  }
}

function Text({
  label,
  value,
  onChange,
  multiline,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-eyebrow text-ink/40 block mb-1">{label}</span>
      {multiline ? (
        <textarea
          rows={rows ?? 3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
      )}
    </label>
  );
}

function Number({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block max-w-[140px]">
      <span className="text-eyebrow text-ink/40 block mb-1">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(parseInt(event.target.value, 10) || 0)}
        className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-eyebrow text-ink/40 block mb-1">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ListInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="text-label text-ink/45 hover:text-terracotta px-2"
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

function CtaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Cta | null;
  onChange: (value: Cta | null) => void;
}) {
  if (!value) {
    return (
      <div>
        <p className="text-eyebrow text-ink/40 mb-1">{label}</p>
        <button
          type="button"
          onClick={() => onChange({ label: "", href: "", variant: "primary" })}
          className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
        >
          + Add CTA
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-stone p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-eyebrow text-ink/40">{label}</p>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-label text-ink/45 hover:text-terracotta"
        >
          Remove
        </button>
      </div>
      <Text label="Label" value={value.label} onChange={(v) => onChange({ ...value, label: v })} />
      <Text label="Href" value={value.href} onChange={(v) => onChange({ ...value, href: v })} />
      <Select
        label="Variant"
        value={value.variant ?? "primary"}
        options={[
          { value: "primary", label: "Primary" },
          { value: "ghost", label: "Ghost" },
          { value: "ink", label: "Ink" },
        ]}
        onChange={(variant) => onChange({ ...value, variant: variant as Cta["variant"] })}
      />
    </div>
  );
}

function CtasInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: Cta[];
  onChange: (values: Cta[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>
      {values.map((cta, index) => (
        <CtaInput
          key={index}
          label={`#${index + 1}`}
          value={cta}
          onChange={(next) => {
            if (next === null) onChange(values.filter((_, i) => i !== index));
            else {
              const list = [...values];
              list[index] = next;
              onChange(list);
            }
          }}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, { label: "", href: "", variant: "primary" }])}
        className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
      >
        + Add CTA
      </button>
    </div>
  );
}

function MediaInput({
  label,
  value,
  onChange,
  frame = "video",
}: {
  label: string;
  value: MediaRef;
  onChange: (value: MediaRef) => void;
  frame?: ImageFramePreset;
}) {
  const [picking, setPicking] = useState(false);
  const [positioning, setPositioning] = useState(false);
  const focusX = Math.round((value.focal_x ?? 0.5) * 100);
  const focusY = Math.round((value.focal_y ?? 0.5) * 100);
  const hasCustomFocus =
    value.focal_x !== undefined &&
    value.focal_y !== undefined &&
    (focusX !== DEFAULT_MOBILE_FOCUS.x || focusY !== DEFAULT_MOBILE_FOCUS.y);

  return (
    <div className="space-y-2">
      <p className="text-eyebrow text-ink/40">{label}</p>
      <div className="rounded-2xl border border-[var(--hairline)] bg-stone p-3 space-y-2">
        <div className="flex items-center gap-3">
          {value.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.src}
              alt={value.alt ?? ""}
              className="size-16 rounded-xl object-cover bg-ink/[0.04]"
            />
          ) : (
            <div className="size-16 rounded-xl bg-ink/[0.04] flex items-center justify-center text-label text-ink/45">
              empty
            </div>
          )}
          <div className="flex-1 space-y-1.5">
            <Text
              label="URL"
              value={value.src}
              onChange={(src) => onChange({ ...value, src })}
            />
            <Text
              label="Alt text"
              value={value.alt ?? ""}
              onChange={(alt) => onChange({ ...value, alt: alt || undefined })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
          >
            Pick from library
          </button>
          {value.src && (
            <button
              type="button"
              onClick={() => setPositioning(true)}
              className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
            >
              {hasCustomFocus ? "Edit phone position" : "Position for phone"}
            </button>
          )}
        </div>
        {hasCustomFocus && (
          <p className="text-label text-ink/45">
            Phone focus set · {focusX}% × {focusY}%
          </p>
        )}
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(media) => {
            onChange({
              ...value,
              src: media.url,
              alt: value.alt ?? media.alt ?? undefined,
              width: media.width ?? undefined,
              height: media.height ?? undefined,
              id: media.id,
            });
            setPicking(false);
          }}
        />
      )}
      {positioning && value.src && (
        <FocalPointModal
          src={value.src}
          frame={frame}
          focus={{ x: focusX, y: focusY }}
          onClose={() => setPositioning(false)}
          onSave={(focus) => {
            onChange({
              ...value,
              focal_x: focus.x / 100,
              focal_y: focus.y / 100,
            });
            setPositioning(false);
          }}
        />
      )}
    </div>
  );
}
