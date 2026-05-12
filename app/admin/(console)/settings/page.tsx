import Link from "next/link";
import { ConsoleHeader } from "@/components/admin/ConsoleHeader";

export const metadata = { title: "Settings · Admin" };

type SettingsCard = {
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
  status: "available" | "coming";
};

const SETTINGS_CARDS: SettingsCard[] = [
  {
    eyebrow: "01",
    title: "Page visibility",
    body: "Control which pages appear in the navigation and on the homepage.",
    href: "/admin/settings/visibility",
    status: "available",
  },
  {
    eyebrow: "02",
    title: "Admins",
    body: "Add or remove admin accounts. Manage roles and permissions.",
    href: "/admin/settings/admins",
    status: "available",
  },
  {
    eyebrow: "03",
    title: "Security",
    body: "Two-factor authentication and account security settings.",
    href: "/admin/settings/security",
    status: "available",
  },
  {
    eyebrow: "04",
    title: "Email templates",
    body: "Auto-reply and admin-notification copy ship from Resend.",
    status: "coming",
  },
  {
    eyebrow: "05",
    title: "Brand tokens",
    body: "Hero CTA, footer copy, default SEO live in cms_settings.",
    status: "coming",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="09 / Settings"
        title="Console settings"
        subtitle="Admin team, branding tokens, email templates."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {SETTINGS_CARDS.map((card) => {
          const content = (
            <>
              <p className="text-eyebrow text-ink/45">{card.eyebrow}</p>
              <h3 className="text-h3 text-ink mt-2">{card.title}</h3>
              <p className="text-body text-ink/70 mt-2">{card.body}</p>
              {card.status === "coming" && (
                <p className="text-label text-ink/45 mt-6">Coming soon</p>
              )}
              {card.status === "available" && (
                <p className="text-label text-ink/65 mt-6">Configure →</p>
              )}
            </>
          );

          if (card.href) {
            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-3xl border border-[var(--hairline)] p-6 bg-stone hover:border-[var(--hairline-strong)] hover:bg-ink/[0.02] transition-colors"
              >
                {content}
              </Link>
            );
          }

          return (
            <article
              key={card.title}
              className="rounded-3xl border border-[var(--hairline)] p-6 bg-stone"
            >
              {content}
            </article>
          );
        })}
      </div>
    </div>
  );
}
