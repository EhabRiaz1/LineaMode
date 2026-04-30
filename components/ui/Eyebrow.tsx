import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
  number,
}: {
  children: React.ReactNode;
  className?: string;
  number?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-eyebrow text-current/70",
        className,
      )}
    >
      {number ? (
        <span className="font-mono opacity-50">/ {number}</span>
      ) : (
        <span className="size-1 rounded-full bg-current opacity-60" />
      )}
      {children}
    </span>
  );
}
