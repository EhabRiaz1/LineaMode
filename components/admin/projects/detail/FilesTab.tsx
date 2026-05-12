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
  const files = project.attachments ?? [];

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
    <div className="overflow-hidden rounded-3xl border border-[var(--hairline)]">
      <table className="w-full text-left">
        <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
          <tr>
            <th className="px-5 py-3 font-normal">File</th>
            <th className="px-5 py-3 font-normal">Type</th>
            <th className="px-5 py-3 font-normal text-right">Size</th>
            <th className="px-5 py-3 font-normal">Uploaded</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
