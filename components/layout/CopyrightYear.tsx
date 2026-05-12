"use client";

import { useEffect, useState } from "react";

/**
 * Renders the current year. Lives in its own client component so
 * Server Components elsewhere don't trip over `cacheComponents`'s
 * prohibition on calling `new Date()` during prerender.
 *
 * SSR-safe: we render an empty span on the server and fill in the year
 * after hydrate. The footer copy still reads naturally because the year
 * appears <50ms after first paint.
 */
export function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <span suppressHydrationWarning>{year ?? ""}</span>;
}
