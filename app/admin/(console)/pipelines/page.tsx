import Link from "next/link";
import { ConsoleHeader } from "@/components/admin/ConsoleHeader";

export const metadata = { title: "Pipelines · Admin" };

const PIPELINES = [
  {
    type: "design_idea",
    number: "01",
    title: "From an idea",
    description: "For clients who have a concept but need help bringing it to life with design and manufacturing.",
  },
  {
    type: "design_scratch",
    number: "02",
    title: "From scratch",
    description: "Full-service engagement from initial concept through to production-ready specifications.",
  },
  {
    type: "manufacture_existing",
    number: "03",
    title: "From a CAD",
    description: "For clients with existing designs and tech packs ready for manufacturing.",
  },
];

export default function PipelinesPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="Pipelines"
        title="Questionnaire flows"
        subtitle="Configure the questions and flow for each intake pipeline."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PIPELINES.map((pipeline) => (
          <Link
            key={pipeline.type}
            href={`/admin/pipelines/${pipeline.type}`}
            className="group rounded-3xl border border-[var(--hairline)] bg-stone p-6 hover:border-[var(--hairline-strong)] hover:bg-ink/[0.02] transition-colors"
          >
            <div className="flex items-start justify-between">
              <p className="text-eyebrow text-ink/45">{pipeline.number}</p>
              <div className="size-2 rounded-full bg-moss/60" title="Active" />
            </div>
            <h3 className="text-h3 text-ink mt-3">{pipeline.title}</h3>
            <p className="text-body text-ink/65 mt-2">{pipeline.description}</p>
            <p className="text-label text-ink/50 mt-6 group-hover:text-ink transition-colors">
              Edit flow →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
