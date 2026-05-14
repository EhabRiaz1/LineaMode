"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { StatusPill } from "@/components/admin/projects/StatusPill";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/pipelines/types";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "./types";
import { BriefTab } from "./BriefTab";
import { FilesTab } from "./FilesTab";
import { TimelineTab } from "./TimelineTab";
import { NotesTab } from "./NotesTab";

const TABS = [
  { id: "brief", label: "Brief" },
  { id: "files", label: "Files" },
  { id: "timeline", label: "Timeline" },
  { id: "notes", label: "Notes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { authHeaders, status } = useAdminSession();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tab, setTab] = useState<TabId>("brief");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const res = await adminFetch<{ project: ProjectDetail }>(
      `/api/admin/projects/${projectId}`,
      { authHeaders: authHeaders() },
    );
    if (res.ok) {
      setProject(res.data.project);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [authHeaders, projectId, status]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const updateStatus = async (next: ProjectStatus) => {
    if (!project) return;
    const previous = project.status;
    setProject({ ...project, status: next });
    const res = await adminFetch(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      authHeaders: authHeaders(),
      body: JSON.stringify({ status: next, note: `Status moved to ${next}.` }),
    });
    if (!res.ok) {
      setProject({ ...project, status: previous });
      setError(res.error);
    } else {
      void load();
    }
  };

  const headline = useMemo(() => {
    const customer = project?.customers;
    return (
      customer?.company ||
      customer?.name ||
      customer?.email ||
      "Unnamed project"
    );
  }, [project]);

  if (loading && !project) {
    return <p className="text-body text-ink/55">Loading project…</p>;
  }
  if (!project) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        {error ?? "Project not found."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-6 border-b border-[var(--hairline)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin/projects"
            className="text-label text-ink/55 hover:text-ink"
          >
            ← All projects
          </Link>
          <select
            className="rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/85"
            value={project.status}
            onChange={(event) => void updateStatus(event.target.value as ProjectStatus)}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-eyebrow text-ink/45">
              Pipeline · {project.pipeline_type.replaceAll("_", " ")}
            </p>
            <h1 className="text-h1 text-ink">{headline}</h1>
            <div className="flex flex-wrap items-center gap-3 text-label text-ink/65">
              <span>{project.customers?.email ?? "—"}</span>
              {project.customers?.country && <span>· {project.customers.country}</span>}
              <StatusPill status={project.status} />
            </div>
          </div>
          <div className="text-label text-ink/55 space-y-1 min-w-[180px]">
            <p>
              <span className="text-eyebrow text-ink/40">Step:</span>{" "}
              {project.current_step ?? "—"}
            </p>
            <p>
              <span className="text-eyebrow text-ink/40">Created:</span>{" "}
              {new Date(project.created_at).toLocaleString()}
            </p>
            <p>
              <span className="text-eyebrow text-ink/40">Updated:</span>{" "}
              {new Date(project.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1" aria-label="Project sections">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={tab === entry.id}
              onClick={() => setTab(entry.id)}
              className={cn(
                "rounded-full px-4 py-2 text-label transition-colors",
                tab === entry.id
                  ? "bg-ink text-stone"
                  : "text-ink/65 hover:text-ink hover:bg-ink/5",
              )}
            >
              {entry.label}
            </button>
          ))}
        </nav>
      </header>

      <section>
        {tab === "brief" && <BriefTab project={project} onChange={load} />}
        {tab === "files" && <FilesTab project={project} onChange={load} />}
        {tab === "timeline" && <TimelineTab project={project} onChange={load} />}
        {tab === "notes" && <NotesTab project={project} onChange={load} />}
      </section>
    </div>
  );
}
