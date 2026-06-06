import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "ink";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ink text-[var(--color-stone-veil)] hover:bg-ink/85",
  ink: "bg-stone text-ink hover:bg-stone/90 ring-1 ring-ink/15",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 ring-1 ring-ink/25",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-label",
  md: "h-11 px-5 text-label",
  lg: "h-14 px-7 text-label",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Omit the leading dot and trailing arrow. */
  plain?: boolean;
};

export function ButtonLink({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
  plain = false,
}: CommonProps & { href: string; external?: boolean }) {
  const styles = cn(
    "inline-flex items-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group/btn",
    plain ? "gap-0" : "gap-3",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const inner = plain ? (
    <span>{children}</span>
  ) : (
    <>
      <span className="size-1.5 rounded-full bg-current transition-transform duration-500 group-hover/btn:scale-150" />
      <span>{children}</span>
      <svg
        viewBox="0 0 16 16"
        className="size-3 transition-transform duration-500 group-hover/btn:translate-x-1"
        fill="none"
      >
        <path
          d="M3 8h10m-4-4 4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={styles}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={styles}>
      {inner}
    </Link>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button(
  { variant = "primary", size = "md", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center gap-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group/btn",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      <span className="size-1.5 rounded-full bg-current transition-transform duration-500 group-hover/btn:scale-150" />
      <span>{children}</span>
    </button>
  );
});
