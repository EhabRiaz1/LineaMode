"use client";

import { useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import type { ProjectDetail } from "./types";

export function NotesTab({
  project,
  onChange,
}: {
  project: ProjectDetail;
  onChange: () => void;
}) {
  const { authHeaders } = useAdminSession();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await adminFetch(`/api/admin/projects/${project.id}/notes`, {
      method: "POST",
      authHeaders: authHeaders(),
      body: JSON.stringify({ body: body.trim() }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setBody("");
    onChange();
  };

  const sorted = [...project.project_notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form
        onSubmit={submit}
        className="lg:col-span-5 space-y-3 rounded-3xl border border-[var(--hairline)] bg-stone p-5 h-fit"
      >
        <p className="text-eyebrow text-ink/45">Add a note</p>
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Free-form note. Visible to admins only."
          rows={6}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
        {error && <p className="text-label text-terracotta">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="w-full rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save note"}
        </button>
      </form>

      <ul className="lg:col-span-7 space-y-3">
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[var(--hairline)] px-6 py-10 text-center text-ink/55">
            No notes yet.
          </li>
        )}
        {sorted.map((note) => (
          <li
            key={note.id}
            className="rounded-2xl border border-[var(--hairline)] bg-stone p-4"
          >
            <p className="text-body text-ink whitespace-pre-wrap">{note.body}</p>
            <p className="text-label text-ink/45 mt-3">
              {new Date(note.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
