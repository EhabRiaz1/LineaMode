import { useEffect, useState } from "react";

/**
 * Detects back/forward cache restores (Chrome/Safari) via the `pageshow`
 * event's `persisted` flag. Useful for re-triggering scroll/visibility-driven
 * animations that might stay in their "hidden" initial state after BFCache
 * restore.
 */
export function useBfcacheRestore(): boolean {
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const handler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setRestored(true);
      }
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  return restored;
}
