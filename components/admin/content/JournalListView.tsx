"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";

type EntryRow = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  category: string | null;
  published_at: string | null;
  updated_at: string;
};

export function JournalListView() {
  const { authHeaders, status } = useAdminSession();
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateSuccess, setMigrateSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const res = await adminFetch<{ entries: EntryRow[] }>("/api/admin/cms/journal", {
      authHeaders: authHeaders(),
    });
    if (res.ok) setRows(res.data.entries ?? []);
    else setError(res.error);
    setLoading(false);
  }, [authHeaders, status]);

  const migrateEntries = useCallback(async () => {
    if (status !== "authenticated" || migrating) return;
    setMigrating(true);
    setError(null);
    
    const res = await adminFetch<{ message: string; count: number }>(
      "/api/admin/cms/journal/migrate",
      {
        authHeaders: authHeaders(),
        method: "POST",
      }
    );
    
    setMigrating(false);
    
    if (res.ok) {
      setMigrateSuccess(res.data.message);
      void load();
    } else {
      setError(res.error);
    }
  }, [authHeaders, status, migrating, load]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && rows.length === 0) {
    return <p className="text-body text-ink/55">Loading entries…</p>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Link
          href="/admin/content/journal/new"
          className="rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors"
        >
          + New entry
        </Link>
      </div>
      {migrateSuccess && (
        <div className="rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-body text-moss">
          {migrateSuccess}
        </div>
      )}
      
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--hairline)] px-6 py-16 text-center">
          <p className="text-h3 text-ink">No journal entries in the database</p>
          <p className="text-body text-ink/55 mt-2 max-w-md mx-auto">
            The customer site is currently showing fallback entries. You can migrate these to the CMS for full editing control.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={migrateEntries}
              disabled={migrating}
              className="rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
            >
              {migrating ? "Migrating…" : "Migrate fallback entries"}
            </button>
            <Link
              href="/admin/content/journal/new"
              className="rounded-full border border-[var(--hairline)] text-ink px-5 py-2.5 text-label hover:bg-ink/5 transition-colors"
            >
              Start fresh
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-[var(--hairline)]">
          <table className="w-full text-left">
            <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
              <tr>
                <th className="px-5 py-3 font-normal">Title</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal">Category</th>
                <th className="px-5 py-3 font-normal">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.slug}
                  className="border-t border-[var(--hairline)] hover:bg-ink/[0.02]"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/content/journal/${row.slug}`}
                      className="text-body text-ink"
                    >
                      {row.title}
                    </Link>
                    <p className="text-label text-ink/55">/journal/{row.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-label text-ink/65 capitalize">
                    {row.status}
                  </td>
                  <td className="px-5 py-4 text-label text-ink/65">
                    {row.category ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-label text-ink/55">
                    {new Date(row.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
