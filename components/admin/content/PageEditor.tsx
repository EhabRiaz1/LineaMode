"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  BLOCK_KINDS,
  BLOCK_LABELS,
  emptyBlock,
  type Block,
  type Blocks,
  type Seo,
} from "@/lib/cms/blocks";
import {
  savePageDraft,
  publishPage,
  discardPageDraft,
} from "@/app/admin/(console)/content/_actions";
import { BlockFields } from "./BlockFields";
import { PreviewPanel } from "./PreviewPanel";
import { cn } from "@/lib/utils";

type LoadedPage = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  blocks: Blocks;
  draft_blocks: Blocks | null;
  seo: Seo | null;
  draft_seo: Seo | null;
  version: number;
  updated_at: string;
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2400&q=85";

function seedBlocksForSlug(slug: string): Blocks {
  switch (slug) {
    case "home":
      return [
        {
          type: "hero",
          mediaMode: "image",
          video: "",
          image: { src: HERO_IMAGE, alt: "Editorial garment study — Lineamode Apparel" },
          eyebrow: "01 / Lineamode",
          headline: "From idea to execution.",
          sublines: ["Lineamode Apparel · Islamabad"],
          ctas: [
            { label: "What we do", href: "/capabilities", variant: "ink" },
            { label: "Start a project", href: "/start", variant: "ghost" },
          ],
        },
        {
          type: "capabilities",
          eyebrow: "What we do",
          headline: "One studio, five disciplines.",
        },
        {
          type: "journal_grid",
          eyebrow: "Journal",
          headline: "From the studio.",
          limit: 3,
        },
        {
          type: "cta",
          eyebrow: "Begin",
          headline: "Start a project.",
          body: "Tell us about your next build.",
          cta: { label: "Start a project", href: "/start", variant: "primary" },
        },
      ];
    default:
      return [
        {
          type: "rich_text",
          body: "Start adding sections for this page.",
        },
      ];
  }
}

export function PageEditor({ slug }: { slug: string }) {
  const { authHeaders, token, status } = useAdminSession();
  const [page, setPage] = useState<LoadedPage | null>(null);
  const [blocks, setBlocks] = useState<Blocks>([]);
  const [seo, setSeo] = useState<Seo>({});
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [adding, setAdding] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    const res = await adminFetch<{ page: LoadedPage }>(
      `/api/admin/cms/pages/${slug}`,
      { authHeaders: authHeaders() },
    );
    if (res.ok) {
      const p = res.data.page;
      setPage(p);
      const baseBlocks = p.draft_blocks ?? p.blocks ?? [];
      if ((baseBlocks?.length ?? 0) > 0) {
        setBlocks(baseBlocks);
        setDirty(false);
      } else {
        const seeded = seedBlocksForSlug(slug);
        setBlocks(seeded);
        setDirty(true);
      }
      setSeo(p.draft_seo ?? p.seo ?? {});
      setTitle(p.title);
    } else {
      setError(res.error);
    }
  }, [authHeaders, slug, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const setBlocksAndDirty = useCallback((next: Blocks) => {
    setBlocks(next);
    setDirty(true);
  }, []);

  const updateBlock = useCallback(
    (index: number, next: Block) => {
      setBlocksAndDirty(blocks.map((b, i) => (i === index ? next : b)));
    },
    [blocks, setBlocksAndDirty],
  );

  const moveBlock = useCallback(
    (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= blocks.length) return;
      const next = [...blocks];
      [next[index], next[target]] = [next[target], next[index]];
      setBlocksAndDirty(next);
      setSelected(target);
    },
    [blocks, setBlocksAndDirty],
  );

  const removeBlock = useCallback(
    (index: number) => {
      setBlocksAndDirty(blocks.filter((_, i) => i !== index));
      setSelected(null);
    },
    [blocks, setBlocksAndDirty],
  );

  const addBlock = useCallback(
    (type: Block["type"]) => {
      const next = [...blocks, emptyBlock(type)];
      setBlocksAndDirty(next);
      setSelected(next.length - 1);
      setAdding(false);
    },
    [blocks, setBlocksAndDirty],
  );

  const onSaveDraft = async () => {
    if (!page) return;
    setSavingDraft(true);
    setError(null);
    const result = await savePageDraft(token, {
      slug: page.slug,
      blocks,
      seo,
      title,
    });
    setSavingDraft(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDirty(false);
    void load();
  };

  const onPublish = async () => {
    if (!page) return;
    if (dirty) {
      const saveResult = await savePageDraft(token, {
        slug: page.slug,
        blocks,
        seo,
        title,
      });
      if (!saveResult.ok) {
        setError(saveResult.error);
        return;
      }
    }
    setPublishing(true);
    setError(null);
    const result = await publishPage(token, page.slug);
    setPublishing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDirty(false);
    void load();
  };

  const onDiscard = async () => {
    if (!page) return;
    setDiscarding(true);
    setError(null);
    const result = await discardPageDraft(token, page.slug);
    setDiscarding(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    void load();
  };

  const headerSubtitle = useMemo(() => {
    if (!page) return null;
    return `${page.status} · v${page.version} · updated ${new Date(page.updated_at).toLocaleString()}`;
  }, [page]);

  if (!page) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
            {error}
          </div>
        )}
        <p className="text-body text-ink/55">Loading editor…</p>
      </div>
    );
  }

  const selectedBlock = selected !== null ? blocks[selected] ?? null : null;
  const previewHref = page.slug === "home" ? "/" : `/${page.slug}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="space-y-2">
          <Link
            href="/admin/content/pages"
            className="text-label text-ink/55 hover:text-ink"
          >
            ← All pages
          </Link>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setDirty(true);
            }}
            className="text-h2 text-ink bg-transparent outline-none focus:bg-ink/[0.02] rounded-md -mx-1 px-1 max-w-xl"
          />
          <p className="text-label text-ink/55">{headerSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {dirty && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || savingDraft}
            className="rounded-full bg-ink text-stone px-5 py-2 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
          >
            {publishing ? "Publishing…" : savingDraft ? "Saving…" : "Publish"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
        <div className="space-y-3">
          <p className="text-eyebrow text-ink/45">Page sections</p>
          
          {blocks.map((block, index) => (
            <details
              key={index}
              open={selected === index}
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) {
                  setSelected(index);
                }
              }}
              className="group rounded-2xl border border-[var(--hairline)] bg-stone overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-ink/[0.02] transition-colors list-none">
                <div className="flex items-center gap-3">
                  <span className="text-label text-ink/45 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body text-ink font-medium">
                    {BLOCK_LABELS[block.type]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      moveBlock(index, -1);
                    }}
                    aria-label="Move up"
                    className="size-7 inline-flex items-center justify-center rounded-lg text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      moveBlock(index, 1);
                    }}
                    aria-label="Move down"
                    className="size-7 inline-flex items-center justify-center rounded-lg text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeBlock(index);
                    }}
                    aria-label="Delete block"
                    className="size-7 inline-flex items-center justify-center rounded-lg text-ink/45 hover:text-terracotta hover:bg-terracotta/5 transition-colors"
                  >
                    ✕
                  </button>
                  <span className="ml-1 text-ink/35 group-open:rotate-180 transition-transform">▼</span>
                </div>
              </summary>
              <div className="px-5 pb-5 pt-2 border-t border-[var(--hairline)] space-y-4">
                <BlockFields
                  block={block}
                  onChange={(next) => updateBlock(index, next)}
                />
              </div>
            </details>
          ))}

          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full rounded-2xl border border-dashed border-[var(--hairline)] px-5 py-4 text-label text-ink/65 hover:bg-ink/[0.02] hover:border-ink/30 transition-colors"
            >
              + Add section
            </button>
          ) : (
            <div className="rounded-2xl border border-[var(--hairline)] bg-stone p-3">
              <p className="text-eyebrow text-ink/45 mb-2 px-2">Choose section type</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                {BLOCK_KINDS.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => addBlock(kind)}
                    className="rounded-xl px-4 py-3 text-label text-ink/85 hover:bg-ink/[0.04] text-left transition-colors"
                  >
                    {BLOCK_LABELS[kind]}
                  </button>
                ))}
              </div>
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="text-label text-ink/55 hover:text-ink px-3 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <details className="rounded-2xl border border-[var(--hairline)] bg-stone overflow-hidden mt-6">
            <summary className="px-5 py-4 cursor-pointer hover:bg-ink/[0.02] transition-colors list-none flex items-center justify-between">
              <span className="text-body text-ink font-medium">SEO Settings</span>
              <span className="text-ink/35">▼</span>
            </summary>
            <div className="px-5 pb-5 pt-2 border-t border-[var(--hairline)] space-y-4">
              <Field
                label="Meta title"
                value={seo.title ?? ""}
                onChange={(value) => {
                  setSeo({ ...seo, title: value });
                  setDirty(true);
                }}
              />
              <Field
                label="Description"
                value={seo.description ?? ""}
                onChange={(value) => {
                  setSeo({ ...seo, description: value });
                  setDirty(true);
                }}
                multiline
              />
            </div>
          </details>
        </div>

        <PreviewPanel
          title="Preview"
          subtitle="Shows the published page — no draft cookies."
          previewSrc={previewHref}
          previewNonce={previewNonce}
          iframeTitle={`Preview ${page.title}`}
          height="70vh"
          actions={
            <>
              <button
                type="button"
                onClick={() => setPreviewNonce((n) => n + 1)}
                className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
              >
                Refresh
              </button>
              <Link
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-ink px-4 py-1.5 text-label text-stone hover:bg-ink/85 transition-colors"
              >
                Open live
              </Link>
            </>
          }
        />
      </div>

    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-eyebrow text-ink/40 block mb-1">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
        />
      )}
    </label>
  );
}
