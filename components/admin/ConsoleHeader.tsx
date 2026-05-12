import { cn } from "@/lib/utils";

export function ConsoleHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <header
        className={cn(
          "border-b border-[var(--hairline)] pb-8 text-center",
          className,
        )}
      >
        <p className="text-eyebrow text-ink/45">{eyebrow}</p>
        <h1 className="text-h1 text-ink mt-2 whitespace-nowrap">{title}</h1>
        {subtitle && <p className="text-body text-ink/70 mt-2 max-w-xl mx-auto">{subtitle}</p>}
        {actions && <div className="flex justify-center gap-2 mt-6">{actions}</div>}
      </header>
    );
  }

  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-6 border-b border-[var(--hairline)] pb-8",
        className,
      )}
    >
      <div className="space-y-2 max-w-2xl">
        <p className="text-eyebrow text-ink/45">{eyebrow}</p>
        <h1 className="text-h1 text-ink">{title}</h1>
        {subtitle && <p className="text-body text-ink/70">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
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
