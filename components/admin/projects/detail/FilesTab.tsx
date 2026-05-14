"use client";

import { useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import type { ProjectDetail } from "./types";

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function FilesTab({
  project,
}: {
  project: ProjectDetail;
  onChange: () => void;
}) {
  const { authHeaders } = useAdminSession();
  const files = project.attachments ?? [];
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (attachmentId: string) => {
    setDownloading(attachmentId);
    setError(null);
    const res = await fetch(`/api/admin/projects/${project.id}/attachments/${attachmentId}/download`, {
      headers: authHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    setDownloading(null);

    if (!res.ok) {
      setError(body?.error ?? "Unable to create download link");
      return;
    }

    const url = body?.data?.url;
    if (typeof url === "string") {
      window.location.assign(url);
    }
  };

  const downloadZip = async () => {
    setDownloading("zip");
    setError(null);
    const res = await fetch(`/api/admin/projects/${project.id}/attachments/download-all`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Unable to download ZIP");
      setDownloading(null);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lineamode-project-${project.id}-files.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  if (files.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--hairline)] px-6 py-16 text-center">
        <p className="text-h3 text-ink">No attachments.</p>
        <p className="text-body text-ink/55 mt-2">
          Files referenced in the intake form land here as metadata. Upload originals
          via the follow-up email link.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-label text-ink/55">
          {files.length} attached file{files.length === 1 ? "" : "s"}
        </p>
        {files.length > 1 && (
          <button
            type="button"
            onClick={() => void downloadZip()}
            disabled={downloading === "zip"}
            className="rounded-full bg-ink px-4 py-2 text-label text-stone transition-colors hover:bg-ink/85 disabled:opacity-60"
          >
            {downloading === "zip" ? "Preparing..." : "Download all as ZIP"}
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-3xl border border-[var(--hairline)]">
        <table className="w-full text-left">
          <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
            <tr>
              <th className="px-5 py-3 font-normal">File</th>
              <th className="px-5 py-3 font-normal">Type</th>
              <th className="px-5 py-3 font-normal text-right">Size</th>
              <th className="px-5 py-3 font-normal">Uploaded</th>
              <th className="px-5 py-3 font-normal text-right">Download</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-t border-[var(--hairline)]">
                <td className="px-5 py-4 text-body text-ink">{file.file_name}</td>
                <td className="px-5 py-4 text-body text-ink/65">{file.file_type ?? "—"}</td>
                <td className="px-5 py-4 text-body text-ink/65 text-right tabular-nums">
                  {formatSize(file.file_size_bytes)}
                </td>
                <td className="px-5 py-4 text-label text-ink/55">
                  {new Date(file.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => void downloadFile(file.id)}
                    disabled={downloading === file.id}
                    className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-label text-ink/65 hover:bg-ink/5 hover:text-ink disabled:opacity-60"
                  >
                    {downloading === file.id ? "Opening..." : "Download"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
