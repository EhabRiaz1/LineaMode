"use client";

import type { DashboardStats } from "@/components/admin/dashboard/DashboardGrid";
import { cn } from "@/lib/utils";

export function QuickStatsWidget({
  size,
  data,
  loading,
  error,
}: {
  size: string;
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
}) {
  const stats = data?.quickStats;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-ink/10 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-ink/10 rounded" />
                <div className="h-3 w-16 bg-ink/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-eyebrow text-ink/45 mb-4">Quick Stats</h3>
      {error && <p className="mb-4 text-label text-terracotta">{error}</p>}
      <div
        className={cn(
          "grid gap-6",
          size === "large" ? "grid-cols-4" : size === "medium" ? "grid-cols-2" : "grid-cols-2"
        )}
      >
        <StatItem label="Total Intakes" value={stats?.total_intakes ?? 0} />
        <StatItem label="This Week" value={stats?.this_week ?? 0} accent />
        <StatItem label="Pending Review" value={stats?.pending_review ?? 0} />
        <StatItem label="Active Projects" value={stats?.active_projects ?? 0} />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "font-display text-3xl tabular-nums leading-none tracking-tight",
          accent ? "text-terracotta" : "text-ink"
        )}
      >
        {value.toLocaleString()}
      </p>
      <p className="text-label text-ink/55 mt-1">{label}</p>
    </div>
  );
}
