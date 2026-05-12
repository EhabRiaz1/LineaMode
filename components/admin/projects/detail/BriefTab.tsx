import type { ProjectDetail } from "./types";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

const SIGNAL_LABELS: Record<string, string> = {
  brand_stage: "Brand stage",
  volume_bracket: "Volume bracket",
  calendar_tier: "Calendar tier",
  priorities: "Priorities",
};

export function BriefTab({ project }: { project: ProjectDetail }) {
  const customer = project.customers;
  const enquiry = project.enquiries[0] ?? null;
  const intake = enquiry?.intake ?? {};
  const brief = (project.brief ?? {}) as Record<string, unknown>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-4 space-y-6">
        <section>
          <p className="text-eyebrow text-ink/45 mb-3">Client</p>
          <dl className="space-y-2 text-body text-ink/80">
            <Row label="Name" value={customer?.name} />
            <Row label="Email" value={customer?.email} />
            <Row label="Company" value={customer?.company} />
            <Row label="Country" value={customer?.country} />
            <Row label="Phone" value={customer?.phone} />
          </dl>
        </section>

        <section>
          <p className="text-eyebrow text-ink/45 mb-3">Signals</p>
          <dl className="space-y-2 text-body text-ink/80">
            {Object.entries(SIGNAL_LABELS).map(([key, label]) => (
              <Row
                key={key}
                label={label}
                value={formatValue((project as unknown as Record<string, unknown>)[key])}
              />
            ))}
          </dl>
        </section>

        <section>
          <p className="text-eyebrow text-ink/45 mb-3">Attribution</p>
          <pre className="text-label text-ink/70 bg-ink/[0.03] rounded-xl p-3 overflow-x-auto">
            {JSON.stringify(customer?.attribution ?? {}, null, 2)}
          </pre>
        </section>

        <section>
          <p className="text-eyebrow text-ink/45 mb-3">Device</p>
          <pre className="text-label text-ink/70 bg-ink/[0.03] rounded-xl p-3 overflow-x-auto">
            {JSON.stringify(customer?.device ?? {}, null, 2)}
          </pre>
        </section>
      </aside>

      <article className="lg:col-span-8 space-y-6">
        <section className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
          <p className="text-eyebrow text-ink/45 mb-4">Brief</p>
          <dl className="space-y-3 text-body text-ink/85">
            {Object.entries(brief).length === 0 && (
              <p className="text-ink/60">No brief data captured.</p>
            )}
            {Object.entries(brief).map(([key, value]) => (
              <Row key={key} label={key} value={formatValue(value)} multiline />
            ))}
          </dl>
        </section>

        <section className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
          <p className="text-eyebrow text-ink/45 mb-4">Raw intake</p>
          <pre className="text-label text-ink/70 bg-ink/[0.03] rounded-xl p-3 overflow-x-auto max-h-[40vh]">
            {JSON.stringify(intake, null, 2)}
          </pre>
        </section>
      </article>
    </div>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  return (
    <div className={multiline ? "space-y-1" : "flex items-center gap-3"}>
      <dt className="text-eyebrow text-ink/40 capitalize">{label.replaceAll("_", " ")}</dt>
      <dd className="text-ink/85 break-words">{value && value.length ? value : "—"}</dd>
    </div>
  );
}
