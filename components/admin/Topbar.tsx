"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { cn } from "@/lib/utils";

type SearchHit = {
  kind: "customer" | "project";
  id: string;
  title: string;
  subtitle: string | null;
  updated_at: string;
};

const SECTION_TITLES: Record<string, string> = {
  inbox: "Inbox",
  projects: "Projects",
  pipeline: "Pipeline",
  clients: "Clients",
  content: "Content",
  pages: "Pages",
  journal: "Journal",
  media: "Media",
  insights: "Insights",
  settings: "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const { authHeaders, status } = useAdminSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const breadcrumb = useMemo(() => {
    if (!pathname) return "Console";
    const segments = pathname.split("/").filter(Boolean).slice(1); // strip "admin"
    if (segments.length === 0) return "Overview";
    return segments
      .map((seg) => SECTION_TITLES[seg] ?? seg.replace(/-/g, " "))
      .join(" · ");
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else {
      setQuery("");
      setHits([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || status !== "authenticated") return;
    if (!query || query.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}`,
          { headers: { ...authHeaders() } },
        );
        const json = await res.json();
        if (cancelled) return;
        setHits(json.data?.hits ?? []);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, open, authHeaders, status]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--hairline)] bg-stone/90 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-8 py-4">
          <div className="min-w-0">
            <p className="text-eyebrow text-ink/45">Console</p>
            <h2 className="text-h3 text-ink truncate">{breadcrumb}</h2>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hidden md:inline-flex items-center gap-3 rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/55 hover:text-ink hover:border-[var(--hairline-strong)] transition-colors"
          >
            <span aria-hidden>⌕</span>
            Search projects, clients…
            <kbd className="ml-3 inline-flex items-center rounded-md border border-[var(--hairline)] px-1.5 py-px text-[10px] tracking-[0.18em] text-ink/60">
              ⌘K
            </kbd>
          </button>
        </div>
      </header>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search the console"
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 backdrop-blur-sm pt-[12vh] px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl rounded-3xl border border-[var(--hairline-strong)] bg-stone shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--hairline)]">
              <span aria-hidden className="text-ink/60">
                ⌕
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects, clients, journal entries…"
                className="flex-1 bg-transparent text-body text-ink placeholder:text-ink/45 outline-none"
              />
              <kbd className="text-label text-ink/40">esc</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto">
              {loading && (
                <li className="px-5 py-4 text-body text-ink/55">Searching…</li>
              )}
              {!loading && query && hits.length === 0 && (
                <li className="px-5 py-4 text-body text-ink/55">No matches.</li>
              )}
              {hits.map((hit) => {
                const href =
                  hit.kind === "project"
                    ? `/admin/projects/${hit.id}`
                    : `/admin/clients?focus=${hit.id}`;
                return (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-ink/5"
                    >
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase",
                          hit.kind === "project"
                            ? "bg-ink text-stone"
                            : "bg-[var(--color-ash-linen)] text-ink",
                        )}
                      >
                        {hit.kind}
                      </span>
                      <div className="min-w-0">
                        <p className="text-body text-ink truncate">{hit.title}</p>
                        {hit.subtitle && (
                          <p className="text-label text-ink/55 truncate">{hit.subtitle}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
