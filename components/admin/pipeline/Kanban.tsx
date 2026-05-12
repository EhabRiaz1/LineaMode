"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/pipelines/types";
import type { AdminProjectRow } from "@/components/admin/projects/types";
import { StatusPill } from "@/components/admin/projects/StatusPill";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  reviewing: "Reviewing",
  quoted: "Quoted",
  in_progress: "In progress",
  delivered: "Delivered",
  archived: "Archived",
};

export function Kanban() {
  const { token, authHeaders } = useAdminSession();
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await adminFetch<{ projects: AdminProjectRow[] }>(
      `/api/admin/projects`,
      { authHeaders: authHeaders() },
    );
    if (res.ok) setProjects(res.data.projects ?? []);
    else setError(res.error);
    setLoading(false);
  }, [token, authHeaders]);

  useEffect(() => {
    void load();
  }, [load]);

  const lanes = useMemo(() => {
    const by: Record<ProjectStatus, AdminProjectRow[]> = {
      draft: [],
      reviewing: [],
      quoted: [],
      in_progress: [],
      delivered: [],
      archived: [],
    };
    for (const project of projects) by[project.status].push(project);
    return by;
  }, [projects]);

  const moveTo = async (projectId: string, status: ProjectStatus) => {
    const previous = projects;
    setProjects((current) =>
      current.map((p) => (p.id === projectId ? { ...p, status } : p)),
    );
    const res = await adminFetch(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      authHeaders: authHeaders(),
      body: JSON.stringify({ status, note: `Moved to ${status} via pipeline.` }),
    });
    if (!res.ok) {
      setProjects(previous);
      setError(res.error);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}
      {loading && projects.length === 0 && (
        <p className="text-body text-ink/55">Loading lanes…</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[60vh]">
        {PROJECT_STATUSES.map((status) => (
          <div
            key={status}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              const id = event.dataTransfer.getData("text/plain") || dragId;
              if (id) void moveTo(id, status);
              setDragId(null);
            }}
            className={cn(
              "rounded-3xl border border-[var(--hairline)] bg-stone p-3 flex flex-col gap-2 min-h-[40vh]",
              dragId && "border-[var(--hairline-strong)]",
            )}
          >
            <header className="flex items-center justify-between px-1">
              <p className="text-eyebrow text-ink/50">{STATUS_LABELS[status]}</p>
              <span className="text-label text-ink/50">{lanes[status].length}</span>
            </header>
            <div className="flex flex-col gap-2">
              {lanes[status].map((project) => {
                const customer = project.customers;
                return (
                  <article
                    key={project.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", project.id);
                      setDragId(project.id);
                    }}
                    onDragEnd={() => setDragId(null)}
                    className="cursor-grab active:cursor-grabbing rounded-2xl border border-[var(--hairline)] bg-stone-veil p-3 hover:border-[var(--hairline-strong)] transition-colors"
                  >
                    <p className="text-body text-ink truncate">
                      {customer?.company || customer?.name || customer?.email || "Unnamed"}
                    </p>
                    <p className="text-label text-ink/55 truncate">
                      {project.pipeline_type.replaceAll("_", " ")}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <StatusPill status={project.status} />
                      <a
                        href={`/admin/projects/${project.id}`}
                        className="text-label text-ink/55 hover:text-ink"
                      >
                        Open →
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
