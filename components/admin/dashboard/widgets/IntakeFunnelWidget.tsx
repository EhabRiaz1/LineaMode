"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { cn } from "@/lib/utils";

type FunnelData = {
  stage: string;
  count: number;
  color: string;
};

export function IntakeFunnelWidget({ size }: { size: string }) {
  const { status } = useAdminSession();
  const [data, setData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setTimeout(() => {
      setData([
        { stage: "Started", count: 245, color: "bg-ink/15" },
        { stage: "Completed", count: 127, color: "bg-ink/30" },
        { stage: "Reviewed", count: 89, color: "bg-ink/50" },
        { stage: "Quoted", count: 45, color: "bg-terracotta/60" },
        { stage: "Converted", count: 23, color: "bg-terracotta" },
      ]);
      setLoading(false);
    }, 600);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-ink/10 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-ink/10 rounded" style={{ width: `${100 - i * 15}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-eyebrow text-ink/45 mb-4">Intake Funnel</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.stage} className="flex items-center gap-4">
            <span className="text-label text-ink/55 w-20 flex-shrink-0">{item.stage}</span>
            <div className="flex-1 h-8 bg-ink/5 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / maxCount) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                className={cn("h-full rounded-lg", item.color)}
              />
            </div>
            <span className="text-label text-ink tabular-nums w-10 text-right">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
