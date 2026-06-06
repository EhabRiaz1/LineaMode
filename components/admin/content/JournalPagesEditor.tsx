"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  JOURNAL_INTRO_DEFAULTS,
  parseJournalIntro,
  type JournalIntroContent,
} from "@/lib/cms/journal-intro-schema";
import {
  saveJournalIntro,
  publishJournalIntro,
  discardJournalIntroDraft,
  saveJournalEntry,
  revalidateJournalCache,
} from "@/app/admin/(console)/content/_actions";
import { Field, SectionAccordion } from "./EditorFields";
import { MediaPicker, type MediaItem } from "./MediaPicker";
import { PreviewPanel } from "./PreviewPanel";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryRow = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  category: string | null;
  published_at: string | null;
  updated_at: string;
};

type EntryFull = {
  slug: string;
  title: string;
  excerpt: string;
  body_mdx: string;
  category: string;
  read_time: string;
  status: "draft" | "published" | "archived";
  cover_media_id: string | null;
};

const BLANK_ENTRY: EntryFull = {
  slug: "",
  title: "",
  excerpt: "",
  body_mdx: "",
  category: "Studio",
  read_time: "5 min",
  status: "draft",
  cover_media_id: null,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-ink text-stone",
  draft: "bg-ink/10 text-ink/70",
  archived: "bg-ink/5 text-ink/45",
};

// ─── Entry accordion ─────────────────────────────────────────────────────────

function EntryAccordion({
  row,
  token,
  authHeaders,
  onSaved,
  isNew,
  initialData,
  onCancelNew,
}: {
  row?: EntryRow;
  token: string | null;
  authHeaders: () => Record<string, string>;
  onSaved: () => void;
  isNew?: boolean;
  initialData?: EntryFull;
  onCancelNew?: () => void;
}) {
  const [open, setOpen] = useState(!!isNew);
  const [loaded, setLoaded] = useState(false);
  const [entry, setEntry] = useState<EntryFull>(initialData ?? BLANK_ENTRY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>("");

  const loadFull = useCallback(async () => {
    if (!row || loaded) return;
    const res = await adminFetch<{ entry: EntryFull }>(
      `/api/admin/cms/journal/${row.slug}`,
      { authHeaders: authHeaders() },
    );
    if (res.ok) {
      setEntry({ ...res.data.entry, body_mdx: res.data.entry.body_mdx ?? "" });
      setLoaded(true);
    } else {
      setError(res.error);
    }
  }, [authHeaders, loaded, row]);

  const onOpen = () => {
    setOpen(true);
    void loadFull();
  };

  const onSave = async (statusOverride?: EntryFull["status"]) => {
    setSaving(true);
    setError(null);
    // Auto-generate slug from title if creating a new entry
    const slug = isNew ? slugify(entry.title) : entry.slug;
    if (!slug) { setError("Title is required to generate a URL slug."); setSaving(false); return; }
    const result = await saveJournalEntry(token, {
      slug,
      title: entry.title,
      excerpt: entry.excerpt,
      body_mdx: entry.body_mdx,
      category: entry.category || undefined,
      read_time: entry.read_time || undefined,
      cover_media_id: entry.cover_media_id ?? undefined,
      status: statusOverride ?? entry.status,
    });
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    onSaved();
    if (isNew) { onCancelNew?.(); return; }
    setLoaded(false); // force reload on next open
  };

  const onDelete = async () => {
    if (!row) return;
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/cms/journal/${row.slug}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) onSaved();
    else setError("Failed to delete entry.");
  };

  const id = row?.slug ?? "new";

  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-stone overflow-hidden">
      {/* Summary row */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : onOpen())}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-ink/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isNew ? (
            <span className="text-body text-ink font-medium">+ New entry</span>
          ) : (
            <>
              <span className="text-body text-ink font-medium truncate">
                {row?.title || row?.slug}
              </span>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0",
                  STATUS_COLORS[row?.status ?? "draft"],
                )}
              >
                {row?.status}
              </span>
              {row?.category && (
                <span className="text-label text-ink/45 shrink-0 hidden md:inline">
                  {row.category}
                </span>
              )}
            </>
          )}
        </div>
        <span className={cn("text-ink/35 transition-transform shrink-0", open && "rotate-180")}>
          ▼
        </span>
      </button>

      {/* Expanded form */}
      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-[var(--hairline)] space-y-4">
          {error && (
            <div className="rounded-xl bg-[var(--color-terracotta)]/10 px-3 py-2 text-label text-terracotta">
              {error}
            </div>
          )}

          {(!row || loaded) ? (
            <>
              {/* Meta fields */}
              {!isNew && (
                <p className="text-label text-ink/45">
                  URL: <span className="font-mono">/journal/{entry.slug}</span>
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Category"
                  value={entry.category}
                  placeholder="Studio"
                  onChange={(v) => setEntry({ ...entry, category: v })}
                />
                <div>
                  <p className="text-eyebrow text-ink/40 block mb-1">Status</p>
                  <select
                    value={entry.status}
                    onChange={(e) => setEntry({ ...entry, status: e.target.value as EntryFull["status"] })}
                    className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <Field
                label="Read time"
                value={entry.read_time}
                placeholder="5 min"
                onChange={(v) => setEntry({ ...entry, read_time: v })}
              />

              {/* Cover image */}
              <div>
                <p className="text-eyebrow text-ink/40 mb-2">Cover image</p>
                <div className="flex items-center gap-3">
                  {(coverUrl || entry.cover_media_id) && (
                    <div className="size-16 rounded-xl overflow-hidden bg-ink/5 shrink-0">
                      {coverUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className="rounded-full border border-[var(--hairline)] bg-stone px-3 py-1.5 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors"
                  >
                    {entry.cover_media_id ? "Change cover" : "Pick cover"}
                  </button>
                  {entry.cover_media_id && (
                    <button
                      type="button"
                      onClick={() => { setEntry({ ...entry, cover_media_id: null }); setCoverUrl(""); }}
                      className="text-label text-ink/45 hover:text-terracotta"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <Field
                label="Title"
                value={entry.title}
                placeholder="Article title"
                onChange={(v) => setEntry({ ...entry, title: v })}
              />
              <Field
                label="Excerpt"
                value={entry.excerpt}
                multiline
                rows={2}
                placeholder="One short paragraph teasing the piece."
                onChange={(v) => setEntry({ ...entry, excerpt: v })}
              />
              <Field
                label="Body (Markdown)"
                value={entry.body_mdx}
                multiline
                rows={14}
                inputClassName="font-mono"
                placeholder={"# Heading\n\nYour article text here. Empty lines separate paragraphs.\n\nUse **bold** and _italic_ for emphasis."}
                onChange={(v) => setEntry({ ...entry, body_mdx: v })}
              />

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => onSave("draft")}
                  disabled={saving || !entry.title}
                  className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save draft"}
                </button>
                <button
                  type="button"
                  onClick={() => onSave("published")}
                  disabled={saving || !entry.title}
                  className="rounded-full bg-ink text-stone px-5 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
                >
                  Publish
                </button>
                {!isNew && (
                  <>
                    <Link
                      href={`/journal/${entry.slug}`}
                      target="_blank"
                      className="text-label text-ink/55 hover:text-ink"
                    >
                      View live ↗
                    </Link>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="ml-auto text-label text-terracotta/70 hover:text-terracotta transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
                {isNew && (
                  <button
                    type="button"
                    onClick={onCancelNew}
                    className="ml-auto text-label text-ink/45 hover:text-ink"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-body text-ink/55">Loading entry…</p>
          )}

          {picking && (
            <MediaPicker
              onClose={() => setPicking(false)}
              onPick={(media: MediaItem) => {
                setCoverUrl(media.url);
                setEntry({ ...entry, cover_media_id: media.id });
                setPicking(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function JournalPagesEditor() {
  const { token, authHeaders, status } = useAdminSession();
  const [intro, setIntro] = useState<JournalIntroContent>(JOURNAL_INTRO_DEFAULTS);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [previewSaving, setPreviewSaving] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(async () => {
    if (status !== "authenticated") return;
    const [introRes, entriesRes] = await Promise.all([
      adminFetch<{ published: JournalIntroContent | null; draft: JournalIntroContent | null }>(
        "/api/admin/cms/journal-intro", { authHeaders: authHeaders() }
      ),
      adminFetch<{ entries: EntryRow[] }>(
        "/api/admin/cms/journal", { authHeaders: authHeaders() }
      ),
    ]);
    if (introRes.ok) {
      setIntro(parseJournalIntro(introRes.data.draft ?? introRes.data.published ?? JOURNAL_INTRO_DEFAULTS));
      setHasDraft(!!introRes.data.draft);
      setDirty(false);
    }
    if (entriesRes.ok) setEntries(entriesRes.data.entries ?? []);
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [loadAll]);

  // Auto-save intro on debounce
  useEffect(() => {
    if (!dirty || status !== "authenticated") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!token) return;
      setPreviewSaving(true);
      const r = await saveJournalIntro(token, intro);
      if (r.ok) { setHasDraft(true); setPreviewNonce(n => n + 1); }
      setPreviewSaving(false);
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro, dirty]);

  const updateIntro = (next: JournalIntroContent) => { setIntro(next); setDirty(true); };

  const onSaveDraft = async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true); setError(null);
    const r = await saveJournalIntro(token, intro);
    setSaving(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(true); setPreviewNonce(n => n + 1);
  };

  const onPublish = async () => {
    if (timer.current) clearTimeout(timer.current);
    setPublishing(true); setError(null);
    if (dirty) { const s = await saveJournalIntro(token, intro); if (!s.ok) { setError(s.error); setPublishing(false); return; } }
    const r = await publishJournalIntro(token);
    setPublishing(false);
    if (!r.ok) { setError(r.error); return; }
    setDirty(false); setHasDraft(false); setPreviewNonce(n => n + 1);
  };

  const onDiscard = async () => {
    setDiscarding(true);
    await discardJournalIntroDraft(token);
    setDiscarding(false); void loadAll();
  };

  const onRefreshCache = async () => {
    setRefreshing(true);
    await revalidateJournalCache(token);
    setRefreshing(false);
    setPreviewNonce(n => n + 1);
  };

  if (loading) return <p className="text-body text-ink/55">Loading editor…</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="space-y-1">
          <Link href="/admin/content/pages" className="text-label text-ink/55 hover:text-ink">
            ← All pages
          </Link>
          <h1 className="text-h2 text-ink">Journal</h1>
          <p className="text-label text-ink/55">
            {hasDraft ? "Intro draft pending · " : ""}
            Edit intro text below. Each entry saves independently.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRefreshCache}
            disabled={refreshing}
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/65 hover:bg-ink/5 transition-colors disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh live site"}
          </button>
          {dirty && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
              Unsaved intro changes
            </span>
          )}
          {hasDraft && (
            <button type="button" onClick={onDiscard} disabled={discarding}
              className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/65 hover:bg-ink/5 transition-colors disabled:opacity-60">
              {discarding ? "Discarding…" : "Discard intro draft"}
            </button>
          )}
          <button type="button" onClick={onSaveDraft} disabled={saving || publishing || !dirty}
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save intro draft"}
          </button>
          <button type="button" onClick={onPublish} disabled={publishing || saving}
            className="rounded-full bg-ink text-stone px-5 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60">
            {publishing ? "Publishing…" : "Publish intro"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        {/* ── Left panel ── */}
        <div className="space-y-3">
          {/* Intro */}
          <p className="text-eyebrow text-ink/45">Journal intro</p>
          <SectionAccordion id="intro" label="Page intro text" selected={selected} onSelect={setSelected}>
            <Field label="Eyebrow" value={intro.eyebrow}
              onChange={(v) => updateIntro({ ...intro, eyebrow: v })} />
            <Field label="Headline — line 1" value={intro.headlineLine1}
              onChange={(v) => updateIntro({ ...intro, headlineLine1: v })} />
            <Field label="Headline — line 2 (italic)" value={intro.headlineLine2}
              onChange={(v) => updateIntro({ ...intro, headlineLine2: v })} />
          </SectionAccordion>

          {/* Entries */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-eyebrow text-ink/45">Journal entries</p>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              disabled={isAddingNew}
              className="rounded-full bg-ink text-stone px-4 py-1.5 text-label hover:bg-ink/85 transition-colors disabled:opacity-50"
            >
              + New entry
            </button>
          </div>

          {isAddingNew && (
            <EntryAccordion
              token={token}
              authHeaders={authHeaders}
              isNew
              onSaved={() => { setIsAddingNew(false); void loadAll(); setPreviewNonce(n => n + 1); }}
              onCancelNew={() => setIsAddingNew(false)}
            />
          )}

          {entries.length === 0 && !isAddingNew && (
            <div className="rounded-2xl border border-dashed border-[var(--hairline)] px-5 py-12 text-center">
              <p className="text-h3 text-ink">No entries in the database yet</p>
              <p className="text-body text-ink/55 mt-2">
                Add your first entry above, or migrate the fallback articles.
              </p>
              <button
                type="button"
                onClick={async () => {
                  const res = await adminFetch<{ message: string }>(
                    "/api/admin/cms/journal/migrate",
                    { authHeaders: authHeaders(), method: "POST" }
                  );
                  if (res.ok) void loadAll();
                }}
                className="mt-6 rounded-full border border-[var(--hairline)] px-5 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors"
              >
                Migrate fallback entries →
              </button>
            </div>
          )}

          {entries.map((row) => (
            <EntryAccordion
              key={row.slug}
              row={row}
              token={token}
              authHeaders={authHeaders}
              onSaved={() => { void loadAll(); setPreviewNonce(n => n + 1); }}
            />
          ))}
        </div>

        <PreviewPanel
          subtitle={
            previewSaving
              ? "Refreshing…"
              : "Intro auto-refreshes · entries reflect after publish"
          }
          previewSrc="/admin/preview/journal"
          previewNonce={previewNonce}
          previewSaving={previewSaving}
          iframeTitle="Journal draft preview"
          actions={
            <>
              <Link
                href="/admin/preview/journal"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
              >
                Full preview ↗
              </Link>
              <Link
                href="/journal"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-ink px-4 py-1.5 text-label text-stone hover:bg-ink/85 transition-colors"
              >
                Live site →
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}

