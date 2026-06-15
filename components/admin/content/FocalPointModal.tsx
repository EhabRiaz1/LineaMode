"use client";

import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_MOBILE_FOCUS,
  IMAGE_FRAME_PRESETS,
  cmsImageObjectPosition,
  type ImageFramePreset,
  type MobileFocus,
} from "@/lib/cms/cms-image";
import { cn } from "@/lib/utils";

type FocalPointModalProps = {
  src: string;
  focus: MobileFocus;
  frame: ImageFramePreset;
  onSave: (focus: MobileFocus) => void;
  onClose: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function FocalPointModal({ src, focus, frame, onSave, onClose }: FocalPointModalProps) {
  const preset = IMAGE_FRAME_PRESETS[frame];
  const frameRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<MobileFocus>(focus);

  const setFocusFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    setDraft({ x: Math.round(x), y: Math.round(y) });
  }, []);

  const frameHeight = Math.round(preset.previewWidth / preset.aspectRatio);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--hairline)] bg-stone p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="mb-4 space-y-1">
          <p className="text-body font-medium text-ink">Position for phone</p>
          <p className="text-label text-ink/55">
            {preset.label} · tap or drag inside the frame to choose what stays visible on
            mobile. Desktop is unchanged.
          </p>
        </div>

        <div className="mx-auto" style={{ width: preset.previewWidth }}>
          <div
            ref={frameRef}
            className="relative overflow-hidden rounded-xl bg-ink/5 ring-1 ring-ink/10 cursor-crosshair touch-none"
            style={{ width: preset.previewWidth, height: frameHeight }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setFocusFromPointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return;
              setFocusFromPointer(e.clientX, e.clientY);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover select-none"
              style={{ objectPosition: cmsImageObjectPosition(draft) }}
            />

            <div
              aria-hidden
              className="pointer-events-none absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-stone bg-ink/80 shadow-[0_0_0_4px_rgba(255,255,255,0.35)]"
              style={{ left: `${draft.x}%`, top: `${draft.y}%` }}
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-stone/40"
            />
          </div>
        </div>

        <p className="mt-3 text-center text-[0.7rem] tracking-[0.08em] text-ink/45 uppercase">
          Focus {draft.x}% · {draft.y}%
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_MOBILE_FOCUS)}
            className="mr-auto rounded-full px-3 py-1.5 text-label text-ink/55 hover:text-ink"
          >
            Reset to center
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/70 hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className={cn(
              "rounded-full bg-ink px-4 py-2 text-label text-stone hover:bg-ink/85",
            )}
          >
            Save position
          </button>
        </div>
      </div>
    </div>
  );
}
