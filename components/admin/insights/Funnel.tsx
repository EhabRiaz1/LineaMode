"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { StatGrid, StatTile } from "@/components/admin/ConsoleHeader";

type FunnelData = {
  totals: {
    landed: number;
    chose_pipeline: number;
    started_letter: number;
    submitted: number;
  };
  sources: { utm_source: string | null; count: number }[];
  by_pipeline: { pipeline_type: string; count: number }[];
};

const NUMBER = new Intl.NumberFormat();

export function Funnel() {
  const { authHeaders, status } = useAdminSession();
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError(null);
    const res = await adminFetch<FunnelData>("/api/admin/insights/funnel", {
      authHeaders: authHeaders(),
    });
    if (res.ok) setData(res.data);
    else setError(res.error);
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const conversion = useMemo(() => {
    if (!data) return null;
    const { landed, submitted } = data.totals;
    if (!landed) return 0;
    return Math.round((submitted / landed) * 1000) / 10;
  }, [data]);

  if (loading && !data) {
    return <p className="text-body text-ink/55">Crunching events…</p>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        {error}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-8">
      <StatGrid>
        <StatTile
          label="Landed on /start"
          value={NUMBER.format(data.totals.landed)}
          tone="accent"
        />
        <StatTile
          label="Picked a pipeline"
          value={NUMBER.format(data.totals.chose_pipeline)}
        />
        <StatTile
          label="Started the letter"
          value={NUMBER.format(data.totals.started_letter)}
        />
        <StatTile
          label="Submitted"
          value={NUMBER.format(data.totals.submitted)}
          hint={conversion !== null ? `${conversion}% conversion` : undefined}
        />
      </StatGrid>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-3xl border border-[var(--hairline)] p-6">
          <p className="text-eyebrow text-ink/45 mb-4">Top sources</p>
          {data.sources.length === 0 ? (
            <p className="text-body text-ink/55">No attribution recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.sources.map((row) => (
                <li
                  key={row.utm_source ?? "direct"}
                  className="flex items-center justify-between text-body text-ink/85"
                >
                  <span>{row.utm_source ?? "direct"}</span>
                  <span className="tabular-nums text-ink/65">{NUMBER.format(row.count)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-3xl border border-[var(--hairline)] p-6">
          <p className="text-eyebrow text-ink/45 mb-4">By pipeline</p>
          <ul className="space-y-2">
            {data.by_pipeline.map((row) => (
              <li
                key={row.pipeline_type}
                className="flex items-center justify-between text-body text-ink/85"
              >
                <span>{row.pipeline_type.replaceAll("_", " ")}</span>
                <span className="tabular-nums text-ink/65">{NUMBER.format(row.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
