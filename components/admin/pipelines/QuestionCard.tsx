"use client";

import { motion } from "motion/react";
import type { PipelineQuestion } from "@/app/api/admin/pipelines/route";
import { cn } from "@/lib/utils";

type Props = {
  question: PipelineQuestion;
  index: number;
  total: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const FIELD_TYPE_ICONS: Record<string, string> = {
  text: "Aa",
  email: "@",
  tel: "#",
  textarea: "¶",
  chips: "◉",
  files: "📎",
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text input",
  email: "Email",
  tel: "Phone",
  textarea: "Long text",
  chips: "Multiple choice",
  files: "File upload",
};

export function QuestionCard({
  question,
  index,
  total,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group relative ml-12"
    >
      <div className="absolute -left-12 top-4 flex items-center justify-center">
        <div
          className={cn(
            "size-8 rounded-full border-2 flex items-center justify-center text-xs font-mono",
            question.required
              ? "border-ink bg-ink text-stone"
              : "border-ink/30 bg-stone text-ink/60"
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div
        onClick={onEdit}
        className="cursor-pointer rounded-2xl border border-[var(--hairline)] bg-stone p-5 hover:border-[var(--hairline-strong)] hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-eyebrow text-ink/45">{question.eyebrow}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-ink/5 text-ink/55">
                {FIELD_TYPE_LABELS[question.field.kind] || question.field.kind}
              </span>
              {question.required && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta">
                  Required
                </span>
              )}
            </div>
            <h4 className="text-body text-ink font-medium truncate">
              {question.prompt}
            </h4>
            {question.helper && (
              <p className="text-label text-ink/55 mt-1 truncate">
                {question.helper}
              </p>
            )}
            <p className="text-xs text-ink/35 mt-2 font-mono">
              → {question.path}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="size-8 inline-flex items-center justify-center rounded-lg text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors"
              title="Duplicate"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="size-8 inline-flex items-center justify-center rounded-lg text-ink/45 hover:text-terracotta hover:bg-terracotta/5 transition-colors"
              title="Delete"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
            <div className="w-px h-4 bg-ink/10 mx-1" />
            <button
              type="button"
              className="size-8 inline-flex items-center justify-center rounded-lg text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>

        {question.field.kind === "chips" && question.field.options && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--hairline)]">
            {question.field.options.map((opt) => (
              <span
                key={opt.value}
                className="text-xs px-2 py-1 rounded-full border border-ink/15 text-ink/65"
              >
                {opt.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
