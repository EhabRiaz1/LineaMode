"use client";

import Link from "next/link";
import { PageEditor } from "@/components/admin/content/PageEditor";
import { HomeEditor } from "@/components/admin/content/HomeEditor";
import { CapabilitiesEditor } from "@/components/admin/content/CapabilitiesEditor";
import { ContactEditor } from "@/components/admin/content/ContactEditor";
import { FoundersEditor } from "@/components/admin/content/FoundersEditor";
import { ProductsEditor } from "@/components/admin/content/ProductsEditor";
import { JournalPagesEditor } from "@/components/admin/content/JournalPagesEditor";
import { AboutEditor } from "@/components/admin/content/AboutEditor";
import { PipelineFlowEditor } from "@/components/admin/pipelines/PipelineFlowEditor";
import { PIPELINE_TYPES, type PipelineType } from "@/lib/pipelines/types";

const PIPELINE_INFO: Record<string, { number: string; title: string }> = {
  "pipeline-design_idea": { number: "01", title: "From an idea" },
  "pipeline-design_scratch": { number: "02", title: "From scratch" },
  "pipeline-manufacture_existing": { number: "03", title: "From a CAD" },
};

const DEDICATED_EDITORS = new Set([
  "home",
  "capabilities",
  "contact",
  "founders",
  "products",
  "journal",
  "about",
]);

/**
 * `slug` is resolved on the server by the page and passed in as a prop.
 *
 * It used to come from `useParams()` here, which breaks under Cache
 * Components: the route's prerendered shell is built with the literal
 * segment, so the client read back "[slug]" and the view stuck on a loading
 * state forever in production. Dev never hit it because the shell isn't
 * prerendered there.
 */
export function ContentPageEditorView({ slug }: { slug: string }) {
  if (slug === "home") return <HomeEditor />;
  if (slug === "capabilities") return <CapabilitiesEditor />;
  if (slug === "contact") return <ContactEditor />;
  if (slug === "founders") return <FoundersEditor />;
  if (slug === "products") return <ProductsEditor />;
  if (slug === "journal") return <JournalPagesEditor />;
  if (slug === "about") return <AboutEditor />;

  if (slug.startsWith("pipeline-")) {
    const pipelineType = slug.replace("pipeline-", "") as PipelineType;
    if (!PIPELINE_TYPES.includes(pipelineType)) {
      return (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          Page not found.
        </div>
      );
    }

    const info = PIPELINE_INFO[slug] ?? { number: "--", title: pipelineType };
    return (
      <div className="space-y-8">
        <div className="border-b border-[var(--hairline)] pb-6">
          <Link href="/admin/content/pages" className="text-label text-ink/55 hover:text-ink">
            ← All pages
          </Link>
          <h1 className="text-h2 text-ink mt-2">
            {info.number} / {info.title}
          </h1>
          <p className="text-label text-ink/55 mt-1">
            Questionnaire flow for the /start intake. Drag to reorder · click any card to edit.
          </p>
        </div>
        <PipelineFlowEditor pipelineType={pipelineType} />
      </div>
    );
  }

  if (DEDICATED_EDITORS.has(slug)) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        Unable to load editor for this page.
      </div>
    );
  }

  return <PageEditor slug={slug} />;
}
