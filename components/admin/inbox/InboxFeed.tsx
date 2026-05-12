"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import type { AdminProjectRow } from "@/components/admin/projects/types";
import { ProjectRow } from "@/components/admin/projects/ProjectRow";
import { StatGrid, StatTile } from "@/components/admin/ConsoleHeader";

const RANGE_DAYS = 14;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

type Stats = { total: number; todayCount: number; yesterdayCount: number; draft: number };
const EMPTY_STATS: Stats = { total: 0, todayCount: 0, yesterdayCount: 0, draft: 0 };

export function InboxFeed() {
  const { token } = useAdminSession();
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await adminFetch<{ projects: AdminProjectRow[] }>(
      `/api/admin/projects?days=${RANGE_DAYS}`,
      { authHeaders: { Authorization: `Bearer ${token}` } },
    );
    if (res.ok) {
      setProjects(res.data.projects ?? []);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminProjectRow[]>();
    for (const project of projects) {
      // `new Date(string)` is deterministic — the input is a serialized
      // ISO timestamp, so this is safe under cacheComponents.
      const key = startOfDay(new Date(project.created_at)).toISOString();
      const existing = map.get(key);
      if (existing) existing.push(project);
      else map.set(key, [project]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [projects]);

  // `Date.now()` is non-deterministic; cacheComponents forbids it during
  // initial Client Component render. Compute the date-anchored stats in
  // an effect once mounted and after `projects` arrives.
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  useEffect(() => {
    const today = startOfDay(new Date()).toISOString();
    const yesterday = startOfDay(
      new Date(Date.now() - 24 * 3600 * 1000),
    ).toISOString();
    const todayCount = projects.filter(
      (p) => startOfDay(new Date(p.created_at)).toISOString() === today,
    ).length;
    const yesterdayCount = projects.filter(
      (p) => startOfDay(new Date(p.created_at)).toISOString() === yesterday,
    ).length;
    const draft = projects.filter((p) => p.status === "draft").length;
    setStats({ total: projects.length, todayCount, yesterdayCount, draft });
  }, [projects]);

  return (
    <div className="space-y-8">
      <StatGrid>
        <StatTile label="Last 14 days" value={stats.total} tone="accent" />
        <StatTile label="Today" value={stats.todayCount} hint="new submissions" />
        <StatTile label="Yesterday" value={stats.yesterdayCount} />
        <StatTile label="Awaiting review" value={stats.draft} hint="status = draft" />
      </StatGrid>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      {grouped.length === 0 && !loading && (
        <div className="rounded-3xl border border-dashed border-[var(--hairline)] px-6 py-16 text-center text-ink/55">
          <p className="text-h3 text-ink">All quiet.</p>
          <p className="text-body mt-2">
            New intakes from /start will land here within seconds of submission.
          </p>
        </div>
      )}

      <div className="space-y-10">
        {grouped.map(([dayIso, items]) => {
          const date = new Date(dayIso);
          const label = date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          });
          return (
            <section key={dayIso} className="space-y-3">
              <header className="flex items-center justify-between">
                <h2 className="text-eyebrow text-ink/45">{label}</h2>
                <span className="text-label text-ink/45">{items.length}</span>
              </header>
              <div className="flex flex-col gap-2">
                {items.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
