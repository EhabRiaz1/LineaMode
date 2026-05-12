"use client";

import { useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import type { ProjectDetail } from "./types";

const STATUS_TONE: Record<string, string> = {
  queued: "text-ink/55",
  sent: "text-ink/85",
  failed: "text-terracotta",
};

export function EmailTab({
  project,
  onChange,
}: {
  project: ProjectDetail;
  onChange: () => void;
}) {
  const { authHeaders } = useAdminSession();
  const [subject, setSubject] = useState(`Lineamode · ${project.pipeline_type.replaceAll("_", " ")}`);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await adminFetch(`/api/admin/projects/${project.id}/email`, {
      method: "POST",
      authHeaders: authHeaders(),
      body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setBody("");
    onChange();
  };

  const sorted = [...project.project_emails].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form
        onSubmit={submit}
        className="lg:col-span-5 space-y-3 rounded-3xl border border-[var(--hairline)] bg-stone p-5 h-fit"
      >
        <p className="text-eyebrow text-ink/45">
          Send to {project.customers?.email ?? "—"}
        </p>
        <input
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Subject"
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Plain-text email body. Markdown is allowed."
          rows={9}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
        {error && <p className="text-label text-terracotta">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !subject.trim() || !body.trim()}
          className="w-full rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send email"}
        </button>
      </form>

      <ul className="lg:col-span-7 space-y-3">
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[var(--hairline)] px-6 py-10 text-center text-ink/55">
            No emails sent from the console yet.
          </li>
        )}
        {sorted.map((email) => (
          <li
            key={email.id}
            className="rounded-2xl border border-[var(--hairline)] bg-stone p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-body text-ink">{email.subject}</p>
              <span className={`text-label ${STATUS_TONE[email.status] ?? "text-ink/55"}`}>
                {email.status}
              </span>
            </div>
            <p className="text-label text-ink/55">→ {email.to_address}</p>
            <p className="text-body text-ink/75 whitespace-pre-wrap mt-3">{email.body}</p>
            <p className="text-label text-ink/45 mt-3">
              {new Date(email.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
