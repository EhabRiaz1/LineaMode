"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { Topbar } from "@/components/admin/Topbar";
import { cn } from "@/lib/utils";

type ShellContextValue = {
  collapsed: boolean;
  setCollapsed: (next: boolean | ((prev: boolean) => boolean)) => void;
  /** Phone-only: the sidebar is an off-canvas drawer below md. */
  mobileOpen: boolean;
  setMobileOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function useConsoleShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useConsoleShell must be used inside <ConsoleShell>");
  return ctx;
}

const STORAGE_KEY = "lineamode.adminSidebarCollapsed";

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore the collapsed preference once mounted so SSR markup matches the
  // default (expanded) state and we never flash.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "true") setCollapsed(true);
      } catch {
        // ignore — private mode / disabled storage
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  return (
    <ShellContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}
    >
      <Sidebar />
      <div
        className={cn(
          "transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          // No margin on phones — the sidebar is a drawer there, so reserving
          // 240px would leave the content squeezed into a sliver.
          "ml-0",
          collapsed ? "md:ml-[72px]" : "md:ml-[240px]",
        )}
      >
        <Topbar />
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <div className="fixed bottom-5 right-5 z-40">
        <ThemeToggle floating />
      </div>
    </ShellContext.Provider>
  );
}
