"use client";

import { useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { STEP_STATES, type StepState } from "@/lib/pipelines/types";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "./types";

const STATE_DOT: Record<StepState, string> = {
  pending: "bg-[var(--hairline-strong)]",
  in_progress: "bg-[var(--color-graphite-blue)]",
  blocked: "bg-[var(--color-terracotta)]",
  done: "bg-ink",
};

export function TimelineTab({
  project,
  onChange,
}: {
  project: ProjectDetail;
  onChange: () => void;
}) {
  const { authHeaders } = useAdminSession();
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<StepState>("done");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await adminFetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      authHeaders: authHeaders(),
      body: JSON.stringify({
        currentStep: label.trim(),
        note: note.trim() || undefined,
        stepState: state,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setLabel("");
    setNote("");
    setState("done");
    onChange();
  };

  const sorted = [...project.pipeline_steps].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <ol className="lg:col-span-7 relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--hairline)]">
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[var(--hairline)] px-6 py-10 text-center text-ink/55">
            No timeline events yet.
          </li>
        )}
        {sorted.map((step) => (
          <li key={step.id} className="relative pl-8">
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-2 size-3.5 rounded-full ring-4 ring-stone",
                STATE_DOT[step.state],
              )}
            />
            <div className="rounded-2xl border border-[var(--hairline)] bg-stone p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-body text-ink">{step.label}</p>
                <span className="text-label text-ink/55 capitalize">
                  {step.state.replaceAll("_", " ")}
                </span>
              </div>
              {step.note && <p className="text-body text-ink/70 mt-1">{step.note}</p>}
              <p className="text-label text-ink/45 mt-2">
                {new Date(step.created_at).toLocaleString()}
                {step.actor_role ? ` · ${step.actor_role}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <form
        onSubmit={submit}
        className="lg:col-span-5 space-y-3 rounded-3xl border border-[var(--hairline)] bg-stone p-5 h-fit"
      >
        <p className="text-eyebrow text-ink/45">Add a step</p>
        <input
          required
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Step label, e.g. tech_pack_received"
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note (optional)"
          rows={3}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
        <select
          value={state}
          onChange={(event) => setState(event.target.value as StepState)}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        >
          {STEP_STATES.map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-label text-terracotta">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || !label.trim()}
          className="w-full rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Add step"}
        </button>
      </form>
    </div>
  );
}
