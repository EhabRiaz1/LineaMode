"use client";

import { createContext, useContext, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { Topbar } from "@/components/admin/Topbar";
import { cn } from "@/lib/utils";

type ShellContextValue = {
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

/**
 * The desktop sidebar used to be collapsible, with the preference persisted in
 * localStorage. Removing the toggle meant removing the state too: leaving the
 * stored value in place would have pinned anyone who had collapsed it to a
 * 72px rail with no way to expand it again.
 */
export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ShellContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <Sidebar />
      <div
        className={cn(
          // No margin on phones — the sidebar is a drawer there, so reserving
          // 240px would leave the content squeezed into a sliver.
          "ml-0 md:ml-[240px]",
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
