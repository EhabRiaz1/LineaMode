"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { ProjectFilters, type ProjectFilterState } from "./ProjectFilters";
import { ProjectRow } from "./ProjectRow";
import type { AdminProjectRow } from "./types";

export function ProjectsList() {
  const { token, status } = useAdminSession();
  const [filters, setFilters] = useState<ProjectFilterState>({
    status: "",
    pipelineType: "",
    search: "",
  });
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.pipelineType) params.set("pipelineType", filters.pipelineType);
    if (filters.search) params.set("search", filters.search);

    const res = await adminFetch<{ projects: AdminProjectRow[] }>(
      `/api/admin/projects?${params.toString()}`,
      { authHeaders: { Authorization: `Bearer ${token}` } },
    );

    if (res.ok) {
      setProjects(res.data.projects ?? []);
    } else {
      setError(res.error);
      setProjects([]);
    }
    setLoading(false);
  }, [token, filters.status, filters.pipelineType, filters.search]);

  // Refetch on auto-applied filters (status + pipeline). Search is manual.
  useEffect(() => {
    if (!token) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.status, filters.pipelineType]);

  if (status === "loading") {
    return <p className="text-body text-ink/60">Loading session…</p>;
  }

  return (
    <div className="space-y-6">
      <ProjectFilters
        value={filters}
        onChange={setFilters}
        onSearch={() => void load()}
        loading={loading}
      />
      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {projects.length === 0 && !loading ? (
          <div className="rounded-3xl border border-dashed border-[var(--hairline)] px-6 py-16 text-center text-ink/55">
            <p className="text-h3 text-ink">No projects match these filters.</p>
            <p className="text-body mt-2">Submitted intakes will land here automatically.</p>
          </div>
        ) : (
          projects.map((project) => <ProjectRow key={project.id} project={project} />)
        )}
      </div>
    </div>
  );
}
