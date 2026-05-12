import Link from "next/link";
import type { AdminProjectRow } from "./types";
import { StatusPill } from "./StatusPill";

const formatRelative = (iso: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function ProjectRow({ project }: { project: AdminProjectRow }) {
  const customer = project.customers;
  const headline = customer?.company || customer?.name || customer?.email || "Unnamed client";

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className="group grid grid-cols-12 items-center gap-4 rounded-2xl border border-[var(--hairline)] bg-stone px-5 py-4 hover:border-[var(--hairline-strong)] hover:bg-ink/[0.02] transition-colors"
    >
      <div className="col-span-12 md:col-span-4 min-w-0 flex items-center gap-3">
        <span aria-hidden className="size-2 rounded-full bg-ink/30 group-hover:bg-ink transition-colors" />
        <div className="min-w-0">
          <p className="text-h3 text-ink truncate">{headline}</p>
          <p className="text-label text-ink/55 truncate">
            {customer?.email ?? "—"}
            {customer?.country ? ` · ${customer.country}` : ""}
          </p>
        </div>
      </div>

      <div className="col-span-6 md:col-span-3 text-label text-ink/65">
        <p className="text-eyebrow text-ink/40">Pipeline</p>
        <p className="text-body text-ink/85 truncate">
          {project.pipeline_type.replaceAll("_", " ")}
        </p>
      </div>

      <div className="col-span-6 md:col-span-3 text-label text-ink/65">
        <p className="text-eyebrow text-ink/40">Step</p>
        <p className="text-body text-ink/85 truncate">{project.current_step ?? "—"}</p>
      </div>

      <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-3">
        <StatusPill status={project.status} />
        <p className="text-label text-ink/45 whitespace-nowrap">{formatRelative(project.updated_at)}</p>
      </div>
    </Link>
  );
}
