import Link from "next/link";
import { ConsoleHeader } from "@/components/admin/ConsoleHeader";

export const metadata = { title: "Content · Admin" };

const SECTIONS = [
  {
    eyebrow: "05",
    title: "Pages",
    body: "Edit the customer-facing pages — Hero, splits, lookbook teaser, and CTAs. Each save publishes instantly via cache tag invalidation.",
    href: "/admin/content/pages",
  },
  {
    eyebrow: "06",
    title: "Journal",
    body: "Long-form editorial entries that surface across the site.",
    href: "/admin/content/journal",
  },
  {
    eyebrow: "07",
    title: "Media",
    body: "The shared image library. Uploads land in Supabase Storage and are referenced everywhere by id.",
    href: "/admin/content/media",
  },
];

export default function ContentPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="Content"
        title="Content management"
        subtitle="Manage pages, journal entries, and media assets."
        centered
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-3xl border border-[var(--hairline)] bg-stone p-6 hover:border-[var(--hairline-strong)] hover:bg-ink/[0.02] transition-colors"
          >
            <p className="text-eyebrow text-ink/45">{section.eyebrow}</p>
            <h3 className="text-h3 text-ink mt-2">{section.title}</h3>
            <p className="text-body text-ink/70 mt-2">{section.body}</p>
            <p className="text-label text-ink/50 mt-6 group-hover:text-ink transition-colors">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
