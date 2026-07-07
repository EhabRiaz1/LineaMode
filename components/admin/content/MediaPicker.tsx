"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";

export type MediaItem = {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  storage_path: string;
  created_at: string;
};

function isVideoMedia(item: MediaItem): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(item.storage_path) || /\.(mp4|webm)(\?|$)/i.test(item.url);
}

/**
 * Modal that pulls the entire cms_media table and lets the editor pick an
 * asset for a block. Designed as a thin wrapper so MediaLibrary (the full
 * page) can reuse the same loader.
 */
export function MediaPicker({
  onClose,
  onPick,
  mediaFilter = "all",
  overlayZIndex = "z-50",
}: {
  onClose: () => void;
  onPick: (media: MediaItem) => void;
  mediaFilter?: "all" | "image" | "video";
  overlayZIndex?: string;
}) {
  const { authHeaders, status } = useAdminSession();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const visibleItems = items.filter((item) => {
    const video = isVideoMedia(item);
    if (mediaFilter === "video") return video;
    if (mediaFilter === "image") return !video;
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 ${overlayZIndex} bg-ink/60 flex items-center justify-center p-6`}
      onClick={onClose}
    >
      <div
        className="bg-stone rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6 space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-ink/55">Media library</p>
          <button
            type="button"
            onClick={onClose}
            className="text-label text-ink/65 hover:text-ink"
          >
            Close
          </button>
        </div>
        {loading && <p className="text-body text-ink/55">Loading…</p>}
        {error && (
          <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
            {error}
          </div>
        )}
        {visibleItems.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-[var(--hairline)] px-6 py-16 text-center text-ink/55">
            <p className="text-body">
              {mediaFilter === "video" ? "No videos uploaded yet." : "No media uploaded yet."}
            </p>
            <p className="text-label mt-2">
              Upload {mediaFilter === "video" ? "videos" : "images"} from the Media page in the sidebar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPick(item)}
                className="group rounded-2xl overflow-hidden border border-[var(--hairline)] hover:border-[var(--hairline-strong)] transition-colors text-left"
              >
                <div className="aspect-[4/3] bg-ink/[0.04]">
                  {isVideoMedia(item) ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.url}
                      alt={item.alt ?? ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="text-label text-ink truncate">{item.alt || "—"}</p>
                  <p className="text-[10px] text-ink/50 truncate">{item.storage_path}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
