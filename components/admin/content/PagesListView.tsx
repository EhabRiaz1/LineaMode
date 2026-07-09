"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

type PageRow = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  version: number;
  updated_at: string;
  published_at: string | null;
  has_draft: boolean;
};

// Slugs that have no editable content in the admin — excluded from the list.
const HIDDEN_SLUGS = new Set(["design", "lookbook", "sustainability"]);

// Pipeline entries shown below CMS pages (not in cms_pages table).
const PIPELINE_ENTRIES = [
  { type: "design_idea", number: "01", title: "From an idea", route: "/start → pipeline 01" },
  { type: "design_scratch", number: "02", title: "From scratch", route: "/start → pipeline 02" },
  { type: "manufacture_existing", number: "03", title: "From a CAD", route: "/start → pipeline 03" },
] as const;

// Override the display title for specific slugs.
const DISPLAY_TITLES: Record<string, string> = {
  capabilities: "Services",
};

const STATUS_TONE: Record<PageRow["status"], string> = {
  draft: "bg-[var(--color-ash-linen)] text-ink",
  published: "bg-ink text-stone",
  archived: "bg-[var(--hairline-strong)] text-ink",
};

export function PagesListView() {
  const { authHeaders, status, token } = useAdminSession();
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated" || !token) return;
    setLoading(true);
    const res = await adminFetch<{ pages: PageRow[] }>(
      "/api/admin/cms/pages",
      { authHeaders: authHeaders() },
    );
    if (res.ok) setRows((res.data.pages ?? []).filter((r) => !HIDDEN_SLUGS.has(r.slug)));
    else setError(res.error);
    setLoading(false);
  }, [authHeaders, status, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (loading && rows.length === 0) {
    return <p className="text-body text-ink/55">Loading pages…</p>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CMS pages */}
      <div className="overflow-hidden rounded-3xl border border-[var(--hairline)]">
        <table className="w-full text-left">
          <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
            <tr>
              <th className="px-5 py-3 font-normal">Page</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Updated</th>
              <th className="px-5 py-3 font-normal text-right">Version</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug} className="border-t border-[var(--hairline)] hover:bg-ink/[0.02]">
                <td className="px-5 py-4">
                  <Link href={`/admin/content/pages/${row.slug}`} className="block">
                    <p className="text-body text-ink">{DISPLAY_TITLES[row.slug] ?? row.title}</p>
                    <p className="text-label text-ink/55">/{row.slug === "home" ? "" : row.slug}</p>
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-label",
                        STATUS_TONE[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                    {row.has_draft && (
                      <span className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[10px] tracking-[0.18em] uppercase text-ink/65">
                        draft pending
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-label text-ink/65">
                  {new Date(row.updated_at).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-body text-ink/85 text-right tabular-nums">
                  v{row.version}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Questionnaire flows (intake pipelines) */}
      <div>
        <p className="text-eyebrow text-ink/45 mb-3">Questionnaire flows</p>
        <div className="overflow-hidden rounded-3xl border border-[var(--hairline)]">
          <table className="w-full text-left">
            <tbody>
              {PIPELINE_ENTRIES.map((p) => (
                <tr key={p.type} className="border-t border-[var(--hairline)] first:border-t-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-4">
                    <Link href={`/admin/content/pages/pipeline-${p.type}`} className="block">
                      <p className="text-body text-ink">{p.number} / {p.title}</p>
                      <p className="text-label text-ink/55">{p.route}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-label bg-moss/10 text-moss">
                      active
                    </span>
                  </td>
                  <td className="px-5 py-4 text-label text-ink/65" />
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/content/pages/pipeline-${p.type}`}
                      className="text-label text-ink/55 hover:text-ink"
                    >
                      Edit flow →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
