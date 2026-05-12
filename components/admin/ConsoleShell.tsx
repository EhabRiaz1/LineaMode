"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { cn } from "@/lib/utils";

type ShellContextValue = {
  collapsed: boolean;
  setCollapsed: (next: boolean | ((prev: boolean) => boolean)) => void;
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

  // Restore the collapsed preference once mounted so SSR markup matches the
  // default (expanded) state and we never flash.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      // ignore — private mode / disabled storage
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  return (
    <ShellContext.Provider value={{ collapsed, setCollapsed }}>
      <Sidebar />
      <div
        className={cn(
          "transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "ml-[72px]" : "ml-[240px]",
        )}
      >
        <Topbar />
        <main className="px-8 py-8">{children}</main>
      </div>
    </ShellContext.Provider>
  );
}
