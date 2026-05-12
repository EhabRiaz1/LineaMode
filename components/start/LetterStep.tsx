"use client";

import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import type { LetterField as Field, StartFormState } from "@/lib/start/schema";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LetterField } from "./LetterField";
import { easeBrand } from "@/lib/motion/easings";
import { trackStart } from "@/lib/start/analytics";
import { cn } from "@/lib/utils";

function getValue(state: StartFormState, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, state);
}

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

type Props = {
  field: Field;
  state: StartFormState;
  index: number;
  total: number;
  onChange: (path: string, value: unknown) => void;
  onNext: () => void;
  onBack?: () => void;
  error?: string | null;
  submitting?: boolean;
};

export function LetterStep({
  field,
  state,
  index,
  total,
  onChange,
  onNext,
  onBack,
  error,
  submitting,
}: Props) {
  useEffect(() => {
    trackStart("letter_step_view", { step: index, prompt: field.id });
  }, [field.id, index]);

  const isLast = index === total;
  const currentValue = getValue(state, field.path);
  const valuePresent = hasValue(currentValue);

  const buttonLabel = useMemo(() => {
    if (submitting) return "Sending…";
    if (isLast) return "Send the letter";
    if (!field.required && !valuePresent) return "Skip";
    return "Continue →";
  }, [submitting, isLast, field.required, valuePresent]);

  return (
    <motion.section
      key={field.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.55, ease: easeBrand }}
      className="min-h-[100svh] bg-stone text-ink flex items-center"
    >
      <div className="shell w-full">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <aside className="col-span-12 md:col-span-3 space-y-6 md:border-r md:border-ink/10 md:pr-8">
            <p className="font-mono text-eyebrow text-ink/45 tabular-nums">
              {String(index).padStart(2, "0")} <span className="opacity-50">/ {String(total).padStart(2, "0")}</span>
            </p>
            <div className="h-px w-12 bg-ink/20 md:hidden" />
            <Eyebrow className="text-ink/55">{field.eyebrow}</Eyebrow>
            {field.helper && (
              <p className="text-label text-ink/55 max-w-[16rem] hidden md:block">{field.helper}</p>
            )}
          </aside>

          <main className="col-span-12 md:col-span-9 space-y-10 max-w-3xl">
            <h2 className="text-h1 leading-[0.98] text-ink whitespace-pre-line">
              {field.prompt}
            </h2>

            {field.helper && (
              <p className="text-body text-ink/65 max-w-xl md:hidden">{field.helper}</p>
            )}

            <div>
              <LetterField field={field} state={state} onChange={onChange} onSubmit={onNext} />
            </div>

            <p
              role="status"
              aria-live="polite"
              className="text-label text-terracotta min-h-[1.25rem]"
            >
              {error ?? ""}
            </p>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onNext}
                disabled={submitting}
                className={cn(
                  "rounded-full px-6 py-3 text-label transition-colors disabled:opacity-60",
                  isLast
                    ? "bg-[var(--color-terracotta)] text-stone hover:bg-[var(--color-terracotta)]/90"
                    : "bg-ink text-stone hover:bg-ink/85",
                )}
              >
                {buttonLabel}
              </button>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="text-label text-ink/55 hover:text-ink"
                >
                  ← Back
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </motion.section>
  );
}
