"use client";

import { useMemo, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
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

type ContactForm = {
  name: string;
  email: string;
  company: string;
  country: string;
  phone: string;
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function BriefTab({
  project,
  onChange,
}: {
  project: ProjectDetail;
  onChange: () => void;
}) {
  const { authHeaders } = useAdminSession();
  const customer = project.customers;
  const enquiry = project.enquiries[0] ?? null;
  const intake = enquiry?.intake ?? {};
  const brief = (project.brief ?? {}) as Record<string, unknown>;
  const [editingContact, setEditingContact] = useState(false);
  const [contact, setContact] = useState<ContactForm>(() => ({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    company: customer?.company ?? "",
    country: customer?.country ?? "",
    phone: customer?.phone ?? "",
  }));
  const [savingContact, setSavingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const signals = useMemo(
    () =>
      Object.entries(SIGNAL_LABELS).map(([key, label]) => ({
        key,
        label,
        value: formatValue((project as unknown as Record<string, unknown>)[key]),
      })),
    [project],
  );

  const updateContact = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingContact(true);
    setContactError(null);

    const res = await adminFetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      authHeaders: authHeaders(),
      body: JSON.stringify({
        customer: {
          name: contact.name.trim() || null,
          email: contact.email.trim(),
          company: contact.company.trim() || null,
          country: contact.country.trim() || null,
          phone: contact.phone.trim(),
        },
      }),
    });

    setSavingContact(false);
    if (!res.ok) {
      setContactError(res.error);
      return;
    }
    setEditingContact(false);
    onChange();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-4 rounded-3xl border border-[var(--hairline)] bg-stone p-6 h-fit">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-eyebrow text-ink/45">Client</p>
            <button
              type="button"
              onClick={() => {
                if (!editingContact) {
                  setContact({
                    name: customer?.name ?? "",
                    email: customer?.email ?? "",
                    company: customer?.company ?? "",
                    country: customer?.country ?? "",
                    phone: customer?.phone ?? "",
                  });
                }
                setEditingContact((value) => !value);
              }}
              className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-label text-ink/65 hover:bg-ink/5 hover:text-ink"
            >
              {editingContact ? "Cancel" : "Edit"}
            </button>
          </div>

          {editingContact ? (
            <form className="space-y-3" onSubmit={updateContact}>
              <ContactInput label="Name" value={contact.name} onChange={(value) => setContact({ ...contact, name: value })} />
              <ContactInput label="Email" type="email" required value={contact.email} onChange={(value) => setContact({ ...contact, email: value })} />
              <ContactInput label="Phone" type="tel" required value={contact.phone} onChange={(value) => setContact({ ...contact, phone: value })} />
              <ContactInput label="Company" value={contact.company} onChange={(value) => setContact({ ...contact, company: value })} />
              <ContactInput label="Country" value={contact.country} onChange={(value) => setContact({ ...contact, country: value })} />
              {contactError && <p className="text-label text-terracotta">{contactError}</p>}
              <button
                type="submit"
                disabled={savingContact || !contact.email.trim() || contact.phone.replace(/\D/g, "").length < 7}
                className="w-full rounded-full bg-ink px-4 py-2 text-label text-stone disabled:opacity-60"
              >
                {savingContact ? "Saving..." : "Save client"}
              </button>
            </form>
          ) : (
            <dl className="space-y-2 text-body text-ink/80">
              <Row label="Name" value={customer?.name} />
              <Row label="Email" value={customer?.email} />
              <Row label="Phone" value={customer?.phone} />
              <Row label="Company" value={customer?.company} />
              <Row label="Country" value={customer?.country} />
            </dl>
          )}
        </section>

        <article className="xl:col-span-8 space-y-6">
          <section className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
            <p className="text-eyebrow text-ink/45 mb-4">Brief</p>
            <dl className="grid gap-4 text-body text-ink/85 md:grid-cols-2">
              {Object.entries(brief).length === 0 && (
                <p className="text-ink/60">No brief data captured.</p>
              )}
              {Object.entries(brief).map(([key, value]) => (
                <Row key={key} label={key} value={formatValue(value)} multiline />
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
            <p className="text-eyebrow text-ink/45 mb-4">Files attached</p>
            {project.attachments.length === 0 ? (
              <p className="text-body text-ink/55">No files attached to this brief.</p>
            ) : (
              <ul className="divide-y divide-[var(--hairline)]">
                {project.attachments.map((file) => (
                  <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-body text-ink">{file.file_name}</p>
                      <p className="text-label text-ink/45">
                        {file.file_type ?? "File"} · {formatSize(file.file_size_bytes)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      </div>

      <section className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
        <p className="text-eyebrow text-ink/45 mb-4">Signals</p>
        <dl className="grid gap-3 text-body text-ink/80 md:grid-cols-2 lg:grid-cols-4">
          {signals.map((signal) => (
            <Row key={signal.key} label={signal.label} value={signal.value} />
          ))}
        </dl>
      </section>

      <Disclosure title="Raw intake">
        <JsonBlock value={intake} />
      </Disclosure>

      <Disclosure title="Attribution">
        <JsonBlock value={customer?.attribution ?? {}} />
      </Disclosure>

      <Disclosure title="Device">
        <JsonBlock value={customer?.device ?? {}} />
      </Disclosure>
    </div>
  );
}

function ContactInput({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-label text-ink/55">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none focus:ring-2 focus:ring-ink/15"
      />
    </label>
  );
}

function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
      <summary className="cursor-pointer text-eyebrow text-ink/55">{title}</summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[40vh] overflow-x-auto rounded-xl bg-ink/[0.03] p-3 text-label text-ink/70">
      {JSON.stringify(value, null, 2)}
    </pre>
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
