"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeToggle({ floating = false }: { floating?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMounted(true);
      const stored = localStorage.getItem("admin-theme") as Theme | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setTheme(stored);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    let resolvedTheme: "light" | "dark" = "light";

    if (theme === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      resolvedTheme = theme;
    }

    root.classList.remove("admin-light", "admin-dark");
    root.classList.add(`admin-${resolvedTheme}`);
    localStorage.setItem("admin-theme", theme);

    return () => {
      root.classList.remove("admin-light", "admin-dark");
    };
  }, [theme, mounted]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove("admin-light", "admin-dark");
      root.classList.add(`admin-${e.matches ? "dark" : "light"}`);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Record<Theme, Theme> = {
        light: "dark",
        dark: "system",
        system: "light",
      };
      return next[current];
    });
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-label text-ink/55",
          floating
            ? "rounded-full border border-[var(--hairline)] bg-stone shadow-lg"
            : "rounded-lg",
        )}
        aria-label="Toggle theme"
      >
        <span className="w-4 h-4" />
        <span>Theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-label transition-colors",
        floating
          ? "rounded-full border border-[var(--hairline)] bg-stone text-ink/70 shadow-lg hover:bg-ink hover:text-stone"
          : "rounded-lg text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]",
      )}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <ThemeIcon theme={theme} />
      <span className="capitalize">{theme}</span>
    </button>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  const iconClass = "w-4 h-4";
  
  switch (theme) {
    case "light":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
    case "dark":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      );
    case "system":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      );
  }
}
