"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";

type ClientRow = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  country: string | null;
  created_at: string;
  tags: string[] | null;
  project_count: number;
};

export function ClientsList() {
  const { authHeaders, status } = useAdminSession();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await adminFetch<{ clients: ClientRow[] }>(
      `/api/admin/clients?${params.toString()}`,
      { authHeaders: authHeaders() },
    );
    if (res.ok) setRows(res.data.clients ?? []);
    else setError(res.error);
    setLoading(false);
  }, [authHeaders, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by email, name, or company"
          className="w-full max-w-md rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/85 placeholder:text-ink/45 outline-none focus:ring-2 focus:ring-ink/15"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/80 hover:bg-ink hover:text-stone transition-colors disabled:opacity-60"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-[var(--hairline)]">
        <table className="w-full text-left">
          <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
            <tr>
              <th className="px-5 py-3 font-normal">Client</th>
              <th className="px-5 py-3 font-normal">Email</th>
              <th className="px-5 py-3 font-normal">Country</th>
              <th className="px-5 py-3 font-normal text-right">Projects</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-body text-ink/55">
                  No clients yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--hairline)] hover:bg-ink/[0.02]">
                <td className="px-5 py-4">
                  <p className="text-body text-ink">{row.company || row.name || "—"}</p>
                  {row.tags && row.tags.length > 0 && (
                    <p className="text-label text-ink/55 mt-1">{row.tags.join(" · ")}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-body text-ink/80">{row.email}</td>
                <td className="px-5 py-4 text-body text-ink/70">{row.country ?? "—"}</td>
                <td className="px-5 py-4 text-body text-ink/85 text-right tabular-nums">
                  {row.project_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
