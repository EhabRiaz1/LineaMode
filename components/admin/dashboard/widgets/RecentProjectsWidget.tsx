"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdminSession } from "@/components/admin/AdminSession";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  client: string;
  stage: string;
  updated: string;
};

export function RecentProjectsWidget({ size }: { size: string }) {
  const { status } = useAdminSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setTimeout(() => {
      setProjects([
        { id: "1", name: "SS27 Knitwear", client: "Nordic Threads", stage: "sampling", updated: "2h ago" },
        { id: "2", name: "Performance Line", client: "ActiveWear Co", stage: "production", updated: "4h ago" },
        { id: "3", name: "Eco Collection", client: "Green Label", stage: "quoted", updated: "1d ago" },
        { id: "4", name: "Basics Restock", client: "Essentials", stage: "completed", updated: "2d ago" },
      ]);
      setLoading(false);
    }, 700);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayCount = size === "small" ? 3 : size === "medium" ? 4 : 5;

  const stageColors: Record<string, string> = {
    sampling: "bg-yellow-500/10 text-yellow-600",
    production: "bg-moss/10 text-moss",
    quoted: "bg-terracotta/10 text-terracotta",
    completed: "bg-ink/10 text-ink/60",
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-ink/10 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-ink/10 rounded" />
                <div className="w-16 h-4 bg-ink/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-eyebrow text-ink/45">Recent Projects</h3>
        <Link
          href="/admin/projects"
          className="text-label text-ink/45 hover:text-ink transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {projects.slice(0, displayCount).map((project) => (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-ink/[0.03] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-body text-ink truncate">{project.name}</p>
              <p className="text-label text-ink/55">{project.client}</p>
            </div>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize",
                stageColors[project.stage] || "bg-ink/10 text-ink/60"
              )}
            >
              {project.stage}
            </span>
            <span className="text-label text-ink/45 flex-shrink-0">
              {project.updated}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
