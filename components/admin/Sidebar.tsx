"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAdminSession } from "@/components/admin/AdminSession";
import { useConsoleShell } from "@/components/admin/ConsoleShell";
import { cn } from "@/lib/utils";

type Section = {
  heading: string;
  items: { number: string; label: string; href: string }[];
};

const SECTIONS: Section[] = [
  {
    heading: "Overview",
    items: [
      { number: "00", label: "Dashboard", href: "/admin/dashboard" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { number: "01", label: "Inbox", href: "/admin/inbox" },
      { number: "02", label: "Projects", href: "/admin/projects" },
      { number: "03", label: "Clients", href: "/admin/clients" },
    ],
  },
  {
    heading: "Content",
    items: [
      { number: "05", label: "Pages", href: "/admin/content/pages" },
      { number: "06", label: "Media", href: "/admin/content/media" },
    ],
  },
  {
    heading: "Studio",
    items: [{ number: "08", label: "Settings", href: "/admin/settings" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { email, signOut } = useAdminSession();
  const { mobileOpen, setMobileOpen } = useConsoleShell();

  // Navigating on a phone should dismiss the drawer, otherwise it covers the
  // page you just asked for.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Scrim: only rendered on phones, where the sidebar is a drawer. */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-[var(--hairline)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] backdrop-blur-sm",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          // Phones: a drawer that slides in. Desktop: always on-screen.
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
      {/* Shares --admin-header-h with the topbar so both bottom borders line up. */}
      <div className="flex h-[var(--admin-header-h)] shrink-0 items-center px-5 border-b border-[var(--hairline)]">
        <Link href="/admin" className="flex items-center" aria-label="Lineamode admin home">
          <BrandLogo context="light" className="admin-sidebar-logo h-3.5" priority />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-5 space-y-7">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <p className="px-3 mb-2 text-eyebrow text-[var(--sidebar-text-muted)]">
              {section.heading}
            </p>
            <ul className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-label transition-colors",
                        active
                          ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                          : "text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]",
                      )}
                    >
                      <span
                        className={cn(
                          "tabular-nums text-[10px] tracking-[0.18em]",
                          active ? "text-[var(--sidebar-active-muted)]" : "text-[var(--sidebar-text-faint)]",
                        )}
                      >
                        {item.number}
                      </span>
                      <span className="truncate">{item.label}</span>
                      {active && (
                        <span aria-hidden className="ml-auto block size-1.5 rounded-full bg-[var(--sidebar-active-text)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--hairline)] px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-eyebrow text-[var(--sidebar-text-muted)]">Admin</p>
            <p
              className="text-label text-[var(--sidebar-text)] truncate"
              title={email ?? undefined}
            >
              {email ?? "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-label text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:underline"
          >
            Sign out
          </button>
        </div>
        </div>
      </aside>
    </>
  );
}
