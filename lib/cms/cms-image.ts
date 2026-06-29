import type { CSSProperties } from "react";
import { z } from "zod";

export const mobileFocusSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const cmsImageObjectSchema = z.object({
  src: z.string().max(2048),
  mobileSrc: z.string().max(2048).optional(),
  mobileFocus: mobileFocusSchema.optional(),
});

export const cmsImageSchema = z.union([z.string().max(2048), cmsImageObjectSchema]);

export type MobileFocus = z.infer<typeof mobileFocusSchema>;
export type CmsImageObject = z.infer<typeof cmsImageObjectSchema>;
export type CmsImageValue = z.infer<typeof cmsImageSchema>;

export const DEFAULT_MOBILE_FOCUS: MobileFocus = { x: 50, y: 50 };

export type ParsedCmsImage = {
  src: string;
  mobileSrc?: string;
  mobileFocus: MobileFocus;
};

export type ImageFramePreset =
  | "hero"
  | "category-tile"
  | "subcategory-tile"
  | "product-rail"
  | "product-grid"
  | "product-hover"
  | "identity-split"
  | "capability-card"
  | "founder-portrait"
  | "editorial-split"
  | "lookbook"
  | "gallery"
  | "video"
  | "square"
  | "portrait";

export const IMAGE_FRAME_PRESETS: Record<
  ImageFramePreset,
  { aspectRatio: number; label: string; previewWidth: number }
> = {
  hero: { aspectRatio: 9 / 16, label: "Hero (mobile)", previewWidth: 280 },
  "category-tile": { aspectRatio: 380 / 460, label: "Category tile (mobile)", previewWidth: 260 },
  "subcategory-tile": { aspectRatio: 1, label: "Subcategory tile (mobile)", previewWidth: 180 },
  "product-rail": { aspectRatio: 340 / 475, label: "Product rail card (mobile)", previewWidth: 220 },
  "product-grid": { aspectRatio: 4 / 5, label: "Product grid card (mobile)", previewWidth: 220 },
  "product-hover": { aspectRatio: 340 / 475, label: "Product hover (mobile)", previewWidth: 220 },
  "identity-split": { aspectRatio: 4 / 5, label: "Identity image (mobile)", previewWidth: 260 },
  "capability-card": { aspectRatio: 4 / 5, label: "Capability card (mobile)", previewWidth: 240 },
  "founder-portrait": { aspectRatio: 3 / 4, label: "Founder portrait (mobile)", previewWidth: 220 },
  "editorial-split": { aspectRatio: 4 / 5, label: "Editorial image (mobile)", previewWidth: 260 },
  lookbook: { aspectRatio: 3 / 4, label: "Lookbook (mobile)", previewWidth: 260 },
  gallery: { aspectRatio: 1, label: "Gallery tile (mobile)", previewWidth: 200 },
  video: { aspectRatio: 16 / 9, label: "Wide image (mobile)", previewWidth: 300 },
  square: { aspectRatio: 1, label: "Square (mobile)", previewWidth: 240 },
  portrait: { aspectRatio: 3 / 4, label: "Portrait (mobile)", previewWidth: 240 },
};

export function parseCmsImage(raw: unknown, fallbackSrc = ""): ParsedCmsImage {
  if (typeof raw === "string") {
    return { src: raw, mobileFocus: DEFAULT_MOBILE_FOCUS };
  }

  if (raw && typeof raw === "object" && "src" in raw) {
    const value = raw as CmsImageObject;
    const mobileSrc = typeof value.mobileSrc === "string" ? value.mobileSrc.trim() : "";
    return {
      src: typeof value.src === "string" ? value.src : fallbackSrc,
      mobileSrc: mobileSrc || undefined,
      mobileFocus: {
        x: value.mobileFocus?.x ?? DEFAULT_MOBILE_FOCUS.x,
        y: value.mobileFocus?.y ?? DEFAULT_MOBILE_FOCUS.y,
      },
    };
  }

  return { src: fallbackSrc, mobileFocus: DEFAULT_MOBILE_FOCUS };
}

export function cmsImageSrc(raw: unknown, fallbackSrc = ""): string {
  return parseCmsImage(raw, fallbackSrc).src;
}

export function cmsImageMobileSrc(raw: unknown, fallbackSrc = ""): string {
  const parsed = parseCmsImage(raw, fallbackSrc);
  return parsed.mobileSrc ?? parsed.src;
}

export function hasDistinctMobileSrc(raw: unknown): boolean {
  return Boolean(parseCmsImage(raw).mobileSrc);
}

export function cmsImageFocus(raw: unknown): MobileFocus {
  return parseCmsImage(raw).mobileFocus;
}

export function isDefaultMobileFocus(focus: MobileFocus): boolean {
  return focus.x === DEFAULT_MOBILE_FOCUS.x && focus.y === DEFAULT_MOBILE_FOCUS.y;
}

/** Persist as a plain URL when focus is default and no mobile override to keep JSON compact. */
export function serializeCmsImage(value: {
  src: string;
  mobileSrc?: string;
  mobileFocus?: MobileFocus;
}): CmsImageValue {
  if (!value.src) return "";
  const focus = value.mobileFocus ?? DEFAULT_MOBILE_FOCUS;
  const mobileSrc = value.mobileSrc?.trim() || undefined;

  if (isDefaultMobileFocus(focus) && !mobileSrc) return value.src;

  const obj: CmsImageObject = { src: value.src };
  if (mobileSrc) obj.mobileSrc = mobileSrc;
  if (!isDefaultMobileFocus(focus)) obj.mobileFocus = focus;
  return obj;
}

export function cmsImageObjectPosition(focus: MobileFocus): string {
  return `${focus.x}% ${focus.y}%`;
}

export function cmsImageMobileStyle(raw: unknown): CSSProperties | undefined {
  const { mobileFocus } = parseCmsImage(raw);
  if (isDefaultMobileFocus(mobileFocus)) return undefined;
  return {
    ["--cms-mobile-focus" as string]: cmsImageObjectPosition(mobileFocus),
  };
}
