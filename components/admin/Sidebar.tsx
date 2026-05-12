"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAdminSession } from "@/components/admin/AdminSession";
import { useConsoleShell } from "@/components/admin/ConsoleShell";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
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
      { number: "03", label: "Pipelines", href: "/admin/pipelines" },
      { number: "04", label: "Clients", href: "/admin/clients" },
    ],
  },
  {
    heading: "Content",
    items: [
      { number: "05", label: "Pages", href: "/admin/content/pages" },
      { number: "06", label: "Journal", href: "/admin/content/journal" },
      { number: "07", label: "Media", href: "/admin/content/media" },
    ],
  },
  {
    heading: "Studio",
    items: [
      { number: "08", label: "Insights", href: "/admin/insights" },
      { number: "09", label: "Settings", href: "/admin/settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { email, signOut } = useAdminSession();
  const { collapsed, setCollapsed } = useConsoleShell();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[var(--hairline)] bg-stone/95 backdrop-blur-sm",
        "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-[var(--hairline)]">
        <Link href="/admin" className="flex items-center" aria-label="Lineamode admin home">
          {collapsed ? (
            <span className="text-h3 text-ink leading-none font-mono font-bold">L</span>
          ) : (
            <BrandLogo context="light" className="h-3.5" />
          )}
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v) => !v)}
          className="size-7 inline-flex items-center justify-center rounded-full border border-[var(--hairline)] text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors"
        >
          <span aria-hidden className="block h-px w-3 bg-current" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-5 space-y-7">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            {!collapsed && (
              <p className="px-3 mb-2 text-eyebrow text-ink/45">{section.heading}</p>
            )}
            <ul className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-label transition-colors",
                        active
                          ? "bg-ink text-stone"
                          : "text-ink/65 hover:text-ink hover:bg-ink/5",
                      )}
                    >
                      <span
                        className={cn(
                          "tabular-nums text-[10px] tracking-[0.18em]",
                          active ? "text-stone/70" : "text-ink/35",
                        )}
                      >
                        {item.number}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {active && !collapsed && (
                        <span aria-hidden className="ml-auto block size-1.5 rounded-full bg-stone" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--hairline)] px-3 py-3 space-y-3">
        {!collapsed && <ThemeToggle />}
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-eyebrow text-ink/45">Admin</p>
              <p className="text-label text-ink/85 truncate" title={email ?? undefined}>
                {email ?? "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-label text-ink/60 hover:text-ink hover:underline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Sign out"
            className="size-9 inline-flex items-center justify-center rounded-full border border-[var(--hairline)] text-ink/65 hover:text-ink hover:bg-ink/5"
          >
            <span aria-hidden>↩</span>
          </button>
        )}
      </div>
    </aside>
  );
}
