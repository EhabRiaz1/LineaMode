"use client";

import type { LetterField as Field, StartFormState } from "@/lib/start/schema";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * One field's worth of letter UI. Drives every input style on /start so a
 * new question shape (e.g. multi-select chips) only requires extending the
 * `Field['field']` discriminated union here.
 */

type Props = {
  field: Field;
  state: StartFormState;
  onChange: (path: string, value: unknown) => void;
  onSubmit: () => void;
};

function getValue(state: StartFormState, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, state);
}

export function LetterField({ field, state, onChange, onSubmit }: Props) {
  const value = getValue(state, field.path);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Move focus to the field when it mounts. The page is one-question-per-
  // screen, so deep typists never have to chase the caret.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const id = window.setTimeout(() => {
      try {
        node.focus({ preventScroll: false });
      } catch {
        // Some non-input fields (chips, file) won't have ref set. That's fine.
      }
    }, 60);
    return () => window.clearTimeout(id);
  }, [field.id]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" && !event.shiftKey && field.field.kind !== "textarea") {
      event.preventDefault();
      onSubmit();
    }
  };

  switch (field.field.kind) {
    case "text":
    case "email":
    case "tel":
      return (
        <input
          ref={(el) => {
            ref.current = el;
          }}
          type={field.field.kind === "email" ? "email" : field.field.kind === "tel" ? "tel" : "text"}
          value={(value as string) ?? ""}
          placeholder={"placeholder" in field.field ? field.field.placeholder : undefined}
          onChange={(event) => onChange(field.path, event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete={field.field.kind === "email" ? "email" : "off"}
          className="w-full bg-transparent border-b border-ink/15 text-h2 leading-tight text-ink placeholder:text-ink/30 outline-none focus:border-ink/55 transition-colors py-3"
        />
      );
    case "textarea":
      return (
        <textarea
          ref={(el) => {
            ref.current = el;
          }}
          value={(value as string) ?? ""}
          placeholder={"placeholder" in field.field ? field.field.placeholder : undefined}
          rows={"rows" in field.field ? field.field.rows ?? 4 : 4}
          onChange={(event) => onChange(field.path, event.target.value)}
          className="w-full bg-transparent border border-ink/12 rounded-2xl px-4 py-3 text-body leading-relaxed text-ink placeholder:text-ink/35 outline-none focus:border-ink/55 transition-colors resize-y"
        />
      );
    case "chips": {
      const isMulti = field.field.multiple;
      const current = isMulti
        ? ((value as string[] | undefined) ?? [])
        : (value as string | undefined);
      return (
        <div className="flex flex-wrap gap-2">
          {field.field.options.map((option) => {
            const selected = isMulti
              ? Array.isArray(current) && current.includes(option.value)
              : current === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (isMulti) {
                    const next = new Set((current as string[]) ?? []);
                    if (next.has(option.value)) next.delete(option.value);
                    else next.add(option.value);
                    onChange(field.path, Array.from(next));
                  } else {
                    onChange(field.path, selected ? undefined : option.value);
                  }
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-label transition-colors border",
                  selected
                    ? "bg-ink text-stone border-ink"
                    : "border-ink/20 text-ink/85 hover:border-ink/45 hover:bg-ink/[0.03]",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }
    case "files": {
      const list = (value as { name: string; size?: number }[] | undefined) ?? [];
      return (
        <div className="space-y-3">
          <label className="inline-flex cursor-pointer items-center rounded-full border border-ink/20 bg-stone px-5 py-3 text-label text-ink/85 hover:bg-ink hover:text-stone transition-colors">
            <span>{list.length > 0 ? "Add more files" : "Choose files"}</span>
            <input
              type="file"
              multiple
              accept={field.field.accept}
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (!files.length) return;
                const meta = files.map((f) => ({ name: f.name, type: f.type, size: f.size }));
                onChange(field.path, [...list, ...meta]);
              }}
            />
          </label>
          {list.length > 0 && (
            <ul className="space-y-1.5 text-label text-ink/65">
              {list.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onChange(field.path, list.filter((_, i) => i !== index))}
                    className="text-ink/35 hover:text-terracotta"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
  }
}
