import type { ProjectStatus } from "@/lib/pipelines/types";
import { cn } from "@/lib/utils";

const palette: Record<ProjectStatus, string> = {
  draft: "bg-ink text-stone",
  reviewing: "bg-[var(--color-ash-linen)] text-ink",
  quoted: "bg-[var(--color-terracotta)] text-stone",
  in_progress: "bg-[var(--color-graphite-blue)] text-stone",
  delivered: "bg-[var(--color-moss-veil)] text-ink",
  archived: "bg-[var(--hairline-strong)] text-ink",
};

export function StatusPill({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label whitespace-nowrap",
        palette[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {status.replaceAll("_", " ")}
    </span>
  );
}
