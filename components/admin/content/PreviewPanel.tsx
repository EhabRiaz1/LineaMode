"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PreviewViewportToggle } from "./PreviewViewportToggle";
import { PREVIEW_MOBILE_WIDTH, usePreviewViewport } from "./usePreviewViewport";

export function PreviewPanel({
  title = "Live Preview",
  subtitle,
  previewSrc,
  previewNonce,
  previewSaving = false,
  iframeTitle,
  actions,
  height = "78vh",
  minHeight = 520,
  className,
}: {
  title?: string;
  subtitle?: string;
  previewSrc: string;
  previewNonce: number;
  previewSaving?: boolean;
  iframeTitle: string;
  actions?: ReactNode;
  height?: CSSProperties["height"];
  minHeight?: number;
  className?: string;
}) {
  const { viewport, setViewport, mounted, isMobile } = usePreviewViewport();

  return (
    <div className={cn("lg:sticky lg:top-4", className)}>
      <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-stone">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] px-4 py-3">
          <div className="space-y-1">
            <p className="text-body font-medium text-ink">{title}</p>
            {subtitle ? <p className="text-label text-ink/55">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mounted ? (
              <PreviewViewportToggle viewport={viewport} onChange={setViewport} />
            ) : null}
            {actions}
          </div>
        </div>

        <div
          className={cn(
            "relative bg-stone",
            isMobile && "flex justify-center bg-ink/[0.03] px-4 py-6",
          )}
        >
          {previewSaving ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone/70">
              <p className="text-label text-ink/55">Refreshing preview…</p>
            </div>
          ) : null}

          <div
            className={cn(
              "relative w-full",
              isMobile &&
                "max-w-full overflow-hidden rounded-[2rem] border-[6px] border-ink/90 bg-ink shadow-xl",
            )}
            style={isMobile ? { width: PREVIEW_MOBILE_WIDTH } : undefined}
          >
            <iframe
              key={previewNonce}
              src={previewSrc}
              title={iframeTitle}
              className="block w-full border-0 bg-stone"
              style={{ height, minHeight }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
