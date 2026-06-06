"use client";

import { useCallback, useEffect, useState } from "react";

export type PreviewViewport = "desktop" | "mobile";

/** Matches a common mobile breakpoint width for responsive CSS inside the iframe. */
export const PREVIEW_MOBILE_WIDTH = 390;

const STORAGE_KEY = "admin-preview-viewport";

export function usePreviewViewport() {
  const [viewport, setViewportState] = useState<PreviewViewport>("desktop");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMounted(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "mobile" || stored === "desktop") {
        setViewportState(stored);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const setViewport = useCallback((next: PreviewViewport) => {
    setViewportState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return {
    viewport,
    setViewport,
    mounted,
    isMobile: viewport === "mobile",
  };
}
