"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

type Stats = {
  total_intakes: number;
  this_week: number;
  pending_review: number;
  active_projects: number;
};

export function QuickStatsWidget({ size }: { size: string }) {
  const { authHeaders, status } = useAdminSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    
    // In a real app, this would fetch from a stats API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        total_intakes: 127,
        this_week: 12,
        pending_review: 5,
        active_projects: 8,
      });
      setLoading(false);
    }, 500);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

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
