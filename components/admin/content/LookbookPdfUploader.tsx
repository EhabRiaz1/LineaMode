"use client";

import { useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  CMS_DOCUMENTS_BUCKET,
  CMS_DOCUMENTS_MAX_BYTES,
  CMS_DOCUMENTS_MAX_MB,
  isAllowedDocumentType,
} from "@/lib/cms/document-config";
import { cn } from "@/lib/utils";

type SignResponse = { path: string; token: string; publicUrl: string };

/**
 * Drag-and-drop PDF upload for the products lookbook.
 *
 * The file goes straight from the browser to Supabase Storage using a
 * single-use signed URL, so a 40 MB lookbook never passes through the Vercel
 * function and its 4.5 MB body limit. On success the resulting public URL is
 * written back into the editor's `pdfHref` field, which is what the "Explore
 * lookbook" CTA links to.
 */
export function LookbookPdfUploader({
  value,
  onUploaded,
}: {
  value: string;
  onUploaded: (publicUrl: string) => void;
}) {
  const { authHeaders, status } = useAdminSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const isUploadedToBucket = value.includes(`/${CMS_DOCUMENTS_BUCKET}/`);

  const upload = async (file: File) => {
    setError(null);
    setDone(null);

    // Some browsers report an empty type for drag-dropped files; fall back to
    // the extension so a genuine PDF isn't rejected on a technicality.
    const contentType =
      file.type || (/\.pdf$/i.test(file.name) ? "application/pdf" : "");

    if (!isAllowedDocumentType(contentType)) {
      setError("That file isn't a PDF.");
      return;
    }
    if (file.size > CMS_DOCUMENTS_MAX_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setError(`File is ${mb} MB — the limit is ${CMS_DOCUMENTS_MAX_MB} MB.`);
      return;
    }

    setBusy(true);
    try {
      const signed = await adminFetch<SignResponse>("/api/admin/cms/documents/sign", {
        authHeaders: authHeaders(),
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType,
          size: file.size,
        }),
      });

      if (!signed.ok) {
        setError(signed.error);
        return;
      }

      const supabase = getBrowserSupabaseClient();
      const { error: uploadError } = await supabase.storage
        .from(CMS_DOCUMENTS_BUCKET)
        .uploadToSignedUrl(signed.data.path, signed.data.token, file, {
          contentType,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      onUploaded(signed.data.publicUrl);
      setDone(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  const disabled = busy || status !== "authenticated";

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-2xl border border-dashed px-4 py-6 text-center transition-colors",
          dragging
            ? "border-[var(--hairline-strong)] bg-ink/[0.04]"
            : "border-[var(--hairline)] bg-ink/[0.02]",
          disabled && "opacity-60",
        )}
      >
        <p className="text-body text-ink/70">
          {busy ? "Uploading…" : "Drop a PDF here"}
        </p>
        <p className="mt-1 text-label text-ink/45">
          or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="underline hover:text-ink disabled:no-underline"
          >
            choose a file
          </button>{" "}
          · PDF only · up to {CMS_DOCUMENTS_MAX_MB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-3 py-2 text-label text-terracotta">
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-xl border border-moss/30 bg-moss/10 px-3 py-2 text-label text-moss">
          Uploaded {done}. The URL below now points at it — publish to make it live.
        </p>
      )}

      {value && (
        <p className="text-label text-ink/45">
          {isUploadedToBucket ? "Uploaded to the document library. " : "Currently an external link. "}
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink"
          >
            Open current lookbook ↗
          </a>
        </p>
      )}
    </div>
  );
}
