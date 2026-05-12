"use client";

import {
  PIPELINE_TYPES,
  PROJECT_STATUSES,
  type PipelineType,
  type ProjectStatus,
} from "@/lib/pipelines/types";

export type ProjectFilterState = {
  status: ProjectStatus | "";
  pipelineType: PipelineType | "";
  search: string;
};

export function ProjectFilters({
  value,
  onChange,
  onSearch,
  loading,
}: {
  value: ProjectFilterState;
  onChange: (next: ProjectFilterState) => void;
  onSearch: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/80"
        value={value.status}
        onChange={(event) =>
          onChange({ ...value, status: event.target.value as ProjectStatus | "" })
        }
      >
        <option value="">Status · all</option>
        {PROJECT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      <select
        className="rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/80"
        value={value.pipelineType}
        onChange={(event) =>
          onChange({ ...value, pipelineType: event.target.value as PipelineType | "" })
        }
      >
        <option value="">Pipeline · all</option>
        {PIPELINE_TYPES.map((pipeline) => (
          <option key={pipeline} value={pipeline}>
            {pipeline.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <input
          className="rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/85 placeholder:text-ink/45 outline-none focus:ring-2 focus:ring-ink/15"
          placeholder="Search name, email, company"
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/80 hover:bg-ink hover:text-stone transition-colors disabled:opacity-60"
        >
          {loading ? "…" : "Apply"}
        </button>
      </form>
    </div>
  );
}
