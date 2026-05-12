"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { cn } from "@/lib/utils";

type PipelineData = {
  type: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
};

export function PipelineDistributionWidget({ size }: { size: string }) {
  const { status } = useAdminSession();
  const [data, setData] = useState<PipelineData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setTimeout(() => {
      const total = 127;
      setData([
        { type: "design_idea", label: "From an idea", count: 52, percentage: 41, color: "bg-terracotta" },
        { type: "design_scratch", label: "From scratch", count: 45, percentage: 35, color: "bg-moss" },
        { type: "manufacture_existing", label: "From a CAD", count: 30, percentage: 24, color: "bg-graphite" },
      ]);
      setLoading(false);
    }, 650);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = data.reduce((sum, d) => sum + d.count, 0);

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
      
      <div className="h-3 rounded-full bg-ink/5 overflow-hidden flex mb-6">
        {data.map((item, index) => (
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
        {data.map((item) => (
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
