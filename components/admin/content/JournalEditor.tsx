"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { saveJournalEntry } from "@/app/admin/(console)/content/_actions";
import { MediaPicker, type MediaItem } from "./MediaPicker";

type Entry = {
  slug: string;
  title: string;
  excerpt: string | null;
  body_mdx: string | null;
  category: string | null;
  read_time: string | null;
  status: "draft" | "published" | "archived";
  cover_media_id: string | null;
  published_at: string | null;
  updated_at: string;
};

const DEFAULT_ENTRY: Entry = {
  slug: "",
  title: "",
  excerpt: "",
  body_mdx: "",
  category: "Studio",
  read_time: "3 min",
  status: "draft",
  cover_media_id: null,
  published_at: null,
  updated_at: new Date().toISOString(),
};

function resolveRouteSlug(raw: string | string[] | undefined): string | null {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug || slug === "[slug]") return null;
  return slug;
}

export function JournalEditor({ slug: slugOverride }: { slug?: string | null } = {}) {
  const params = useParams<{ slug?: string | string[] }>();
  const routeSlug = resolveRouteSlug(params.slug);
  const isNew = slugOverride === null;
  const slug = isNew ? null : (slugOverride ?? routeSlug);

  const router = useRouter();
  const { token, authHeaders, status } = useAdminSession();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [cover, setCover] = useState<MediaItem | null>(null);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    if (isNew) {
      setEntry({ ...DEFAULT_ENTRY });
      return;
    }
    const res = await adminFetch<{ entry: Entry }>(
      `/api/admin/cms/journal/${slug}`,
      { authHeaders: authHeaders() },
    );
    if (res.ok) {
      setEntry(res.data.entry);
    } else {
      setError(res.error);
    }
  }, [authHeaders, isNew, slug, status]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isNew && !slug) {
    return <p className="text-body text-ink/55">Loading editor…</p>;
  }

  if (!entry) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
            {error}
          </div>
        )}
        <p className="text-body text-ink/55">Loading…</p>
      </div>
    );
  }

  const onSave = async (statusOverride?: Entry["status"]) => {
    setSaving(true);
    setError(null);
    const payload = {
      slug: entry.slug,
      title: entry.title,
      excerpt: entry.excerpt ?? "",
      body_mdx: entry.body_mdx ?? "",
      category: entry.category ?? undefined,
      read_time: entry.read_time ?? undefined,
      cover_media_id: entry.cover_media_id ?? undefined,
      status: statusOverride ?? entry.status,
    };
    const result = await saveJournalEntry(token, payload);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (isNew) router.push(`/admin/content/journal/${entry.slug}`);
    else void load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <Link
            href="/admin/content/journal"
            className="text-label text-ink/55 hover:text-ink"
          >
            ← All entries
          </Link>
          <h1 className="text-h2 text-ink mt-2">
            {isNew ? "New entry" : entry.title || entry.slug}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSave("draft")}
            disabled={saving || !entry.slug || !entry.title}
            className="rounded-full border border-[var(--hairline)] bg-stone px-4 py-2 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => onSave("published")}
            disabled={saving || !entry.slug || !entry.title}
            className="rounded-full bg-ink text-stone px-5 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-3">
          <Field
            label="Slug"
            value={entry.slug}
            onChange={(value) => setEntry({ ...entry, slug: value.replace(/[^a-z0-9-]/g, "-") })}
            placeholder="kebab-case-slug"
            disabled={!isNew}
          />
          <Field
            label="Category"
            value={entry.category ?? ""}
            onChange={(value) => setEntry({ ...entry, category: value || null })}
          />
          <Field
            label="Read time"
            value={entry.read_time ?? ""}
            onChange={(value) => setEntry({ ...entry, read_time: value || null })}
            placeholder="3 min"
          />
          <div className="rounded-2xl border border-[var(--hairline)] bg-stone p-3 space-y-2">
            <p className="text-eyebrow text-ink/40">Cover image</p>
            {cover ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.url}
                  alt={cover.alt ?? ""}
                  className="rounded-xl w-full aspect-[3/2] object-cover"
                />
                <p className="text-label text-ink/55 mt-2 truncate">
                  {cover.storage_path}
                </p>
              </div>
            ) : entry.cover_media_id ? (
              <p className="text-label text-ink/55">
                Linked to media id {entry.cover_media_id}
              </p>
            ) : (
              <p className="text-label text-ink/45">No cover selected.</p>
            )}
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
            >
              Pick cover
            </button>
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-3">
          <Field
            label="Title"
            value={entry.title}
            onChange={(value) => setEntry({ ...entry, title: value })}
            placeholder="The article title"
          />
          <Field
            label="Excerpt"
            value={entry.excerpt ?? ""}
            multiline
            rows={3}
            onChange={(value) => setEntry({ ...entry, excerpt: value })}
            placeholder="One short paragraph teasing the piece."
          />
          <label className="block">
            <span className="text-eyebrow text-ink/40 block mb-1">Body</span>
            <textarea
              value={entry.body_mdx ?? ""}
              onChange={(event) => setEntry({ ...entry, body_mdx: event.target.value })}
              rows={20}
              className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15 font-mono"
              placeholder="Markdown / MDX. Empty lines separate paragraphs."
            />
          </label>
        </section>
      </div>

      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(media) => {
            setCover(media);
            setEntry({ ...entry, cover_media_id: media.id });
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-eyebrow text-ink/40 block mb-1">{label}</span>
      {multiline ? (
        <textarea
          rows={rows ?? 3}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15 disabled:bg-ink/[0.03] disabled:text-ink/55"
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15 disabled:bg-ink/[0.03] disabled:text-ink/55"
        />
      )}
    </label>
  );
}
