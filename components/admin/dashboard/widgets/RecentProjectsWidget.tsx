"use client";

import Link from "next/link";
import type { DashboardStats } from "@/components/admin/dashboard/DashboardGrid";
import { cn } from "@/lib/utils";

export function RecentProjectsWidget({
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
  const projects = data?.recentProjects ?? [];

  const displayCount = size === "small" ? 3 : size === "medium" ? 4 : 5;

  const stageColors: Record<string, string> = {
    draft: "bg-ink/10 text-ink/60",
    reviewing: "bg-yellow-500/10 text-yellow-600",
    quoted: "bg-terracotta/10 text-terracotta",
    in_progress: "bg-moss/10 text-moss",
    delivered: "bg-graphite/10 text-graphite",
    archived: "bg-ink/10 text-ink/45",
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
      {error && <p className="mb-4 text-label text-terracotta">{error}</p>}
      <div className="space-y-3">
        {projects.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--hairline)] px-4 py-8 text-center text-body text-ink/55">
            No projects yet.
          </p>
        )}
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
              {project.stage.replaceAll("_", " ")}
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
