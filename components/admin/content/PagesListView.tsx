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

const STATUS_TONE: Record<PageRow["status"], string> = {
  draft: "bg-[var(--color-ash-linen)] text-ink",
  published: "bg-ink text-stone",
  archived: "bg-[var(--hairline-strong)] text-ink",
};

export function PagesListView() {
  const { authHeaders, status } = useAdminSession();
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const res = await adminFetch<{ pages: PageRow[] }>(
      "/api/admin/cms/pages",
      { authHeaders: authHeaders() },
    );
    if (res.ok) setRows(res.data.pages ?? []);
    else setError(res.error);
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
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
                  <p className="text-body text-ink">{row.title}</p>
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
  );
}
