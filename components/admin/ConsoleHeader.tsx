import { cn } from "@/lib/utils";

/**
 * Every console page uses the same centred header. It used to have an
 * opt-in `centered` variant that only seven of seventeen pages passed, so
 * headings alternated between left- and centre-aligned as you moved around.
 *
 * `whitespace-nowrap` is deliberately absent: at narrow widths a long title
 * would otherwise push the page into horizontal scroll.
 */
export function ConsoleHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-[var(--hairline)] pb-6 text-center md:pb-8",
        className,
      )}
    >
      <p className="text-eyebrow text-ink/45">{eyebrow}</p>
      <h1 className="text-admin-h1 text-ink mt-2 text-balance">{title}</h1>
      {subtitle && (
        <p className="text-body text-ink/70 mt-2 max-w-xl mx-auto text-pretty">
          {subtitle}
        </p>
      )}
      {actions && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">{actions}</div>
      )}
    </header>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--hairline)] p-5 bg-stone",
        tone === "accent" && "bg-ink text-stone border-ink",
      )}
    >
      <p
        className={cn(
          "text-eyebrow",
          tone === "accent" ? "text-stone/60" : "text-ink/45",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-3 font-display text-4xl tabular-nums leading-none tracking-tight",
          tone === "accent" ? "text-stone" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            "mt-2 text-label",
            tone === "accent" ? "text-stone/55" : "text-ink/55",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
