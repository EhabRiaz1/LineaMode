"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import type { MediaItem } from "./MediaPicker";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function MediaLibrary() {
  const { authHeaders, status } = useAdminSession();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const res = await adminFetch<{ media: MediaItem[] }>("/api/admin/cms/media", {
      authHeaders: authHeaders(),
    });
    if (res.ok) setItems(res.data.media ?? []);
    else setError(res.error);
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const [data, dims] = await Promise.all([
        fileToBase64(file),
        readImageDimensions(file),
      ]);
      const res = await adminFetch<{ media: MediaItem }>("/api/admin/cms/media", {
        method: "POST",
        authHeaders: authHeaders(),
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          alt: alt || undefined,
          width: dims?.width,
          height: dims?.height,
          data,
        }),
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setAlt("");
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--hairline)] bg-stone p-5 space-y-3">
        <p className="text-eyebrow text-ink/45">Upload</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <label className="md:col-span-2 block">
            <span className="text-eyebrow text-ink/40 block mb-1">Alt text (optional)</span>
            <input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Concise descriptive text used for accessibility"
              className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
            />
          </label>
          <label className="block cursor-pointer">
            <span className="text-eyebrow text-ink/40 block mb-1">Image</span>
            <span
              className={`block rounded-full bg-ink text-stone text-center px-4 py-2 text-label hover:bg-ink/85 transition-colors ${uploading ? "opacity-60" : ""}`}
            >
              {uploading ? "Uploading…" : "Choose file"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-label text-ink/45">
          Stored in Supabase Storage bucket cms-media. Max 10 MB.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}
      {loading && items.length === 0 && (
        <p className="text-body text-ink/55">Loading library…</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl overflow-hidden border border-[var(--hairline)] bg-stone"
          >
            <div className="aspect-[4/3] bg-ink/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.alt ?? ""}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-3 py-2 space-y-1">
              <p className="text-body text-ink truncate">{item.alt || "—"}</p>
              <p className="text-[10px] text-ink/50 truncate">{item.storage_path}</p>
            </div>
          </article>
        ))}
        {items.length === 0 && !loading && (
          <p className="col-span-full text-body text-ink/55 text-center py-12">
            No images yet.
          </p>
        )}
      </div>
    </div>
  );
}
