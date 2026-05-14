"use client";

import { motion } from "motion/react";
import type { DashboardStats } from "@/components/admin/dashboard/DashboardGrid";
import { cn } from "@/lib/utils";

export function PipelineDistributionWidget({
  data,
  loading,
  error,
}: {
  size: string;
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
}) {
  const distribution = data?.pipelineDistribution ?? [];

  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-36 bg-ink/10 rounded" />
          <div className="h-4 w-full bg-ink/10 rounded-full" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 bg-ink/10 rounded-full" />
                <div className="flex-1 h-3 bg-ink/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-eyebrow text-ink/45 mb-4">Pipeline Distribution</h3>
      {error && <p className="mb-4 text-label text-terracotta">{error}</p>}
      
      <div className="h-3 rounded-full bg-ink/5 overflow-hidden flex mb-6">
        {distribution.map((item, index) => (
          <motion.div
            key={item.type}
            initial={{ width: 0 }}
            animate={{ width: `${item.percentage}%` }}
            transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
            className={cn("h-full first:rounded-l-full last:rounded-r-full", item.color)}
          />
        ))}
      </div>

      <div className="space-y-3">
        {distribution.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full flex-shrink-0", item.color)} />
            <span className="text-body text-ink flex-1">{item.label}</span>
            <span className="text-label text-ink/55 tabular-nums">
              {item.count} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--hairline)]">
        <p className="text-label text-ink/45">
          Total: <span className="text-ink">{total}</span> intakes
        </p>
      </div>
    </div>
  );
}
