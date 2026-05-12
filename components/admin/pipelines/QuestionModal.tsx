"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PipelineQuestion } from "@/app/api/admin/pipelines/route";
import { cn } from "@/lib/utils";

type Props = {
  question: PipelineQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: PipelineQuestion) => void;
  onDelete?: () => void;
};

const FIELD_TYPES = [
  { value: "text", label: "Text input", icon: "Aa" },
  { value: "email", label: "Email", icon: "@" },
  { value: "tel", label: "Phone number", icon: "#" },
  { value: "textarea", label: "Long text", icon: "¶" },
  { value: "chips", label: "Multiple choice", icon: "◉" },
  { value: "files", label: "File upload", icon: "📎" },
] as const;

type FieldKind = (typeof FIELD_TYPES)[number]["value"];

export function QuestionModal({ question, isOpen, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<PipelineQuestion | null>(null);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (question) {
      setForm(question);
      setOptions(question.field.options ?? []);
    }
  }, [question]);

  const handleFieldKindChange = (kind: FieldKind) => {
    if (!form) return;
    const newField: PipelineQuestion["field"] = { kind };
    
    if (kind === "textarea") {
      newField.rows = 4;
      newField.placeholder = form.field.placeholder;
    } else if (kind === "chips") {
      newField.options = options.length > 0 ? options : [{ value: "option_1", label: "Option 1" }];
      newField.multiple = false;
    } else if (kind === "files") {
      newField.accept = ".pdf,.doc,.docx,.jpg,.png";
    } else {
      newField.placeholder = form.field.placeholder;
    }
    
    setForm({ ...form, field: newField });
  };

  const handleAddOption = () => {
    const newOption = {
      value: `option_${options.length + 1}`,
      label: `Option ${options.length + 1}`,
    };
    setOptions([...options, newOption]);
    if (form && form.field.kind === "chips") {
      setForm({
        ...form,
        field: { ...form.field, options: [...options, newOption] },
      });
    }
  };

  const handleUpdateOption = (index: number, field: "value" | "label", value: string) => {
    const newOptions = options.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    setOptions(newOptions);
    if (form && form.field.kind === "chips") {
      setForm({
        ...form,
        field: { ...form.field, options: newOptions },
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (form && form.field.kind === "chips") {
      setForm({
        ...form,
        field: { ...form.field, options: newOptions },
      });
    }
  };

  const handleSave = () => {
    if (!form) return;
    onSave(form);
  };

  if (!form) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl md:max-h-[85vh] overflow-y-auto rounded-3xl bg-stone border border-[var(--hairline)] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--hairline)] bg-stone/95 backdrop-blur-sm">
              <h2 className="text-h3 text-ink">Edit question</h2>
              <button
                type="button"
                onClick={onClose}
                className="size-8 inline-flex items-center justify-center rounded-full border border-[var(--hairline)] text-ink/55 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label text-ink/55 mb-2">Eyebrow</label>
                  <input
                    type="text"
                    value={form.eyebrow}
                    onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                    className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                    placeholder="e.g. Start, Contact, Brief"
                  />
                </div>
                <div>
                  <label className="block text-label text-ink/55 mb-2">Data path</label>
                  <input
                    type="text"
                    value={form.path}
                    onChange={(e) => setForm({ ...form, path: e.target.value })}
                    className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink font-mono placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                    placeholder="e.g. name, brief.goals"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label text-ink/55 mb-2">Question prompt</label>
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-3 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors resize-none"
                  placeholder="What would you like to ask?"
                />
              </div>

              <div>
                <label className="block text-label text-ink/55 mb-2">Helper text (optional)</label>
                <input
                  type="text"
                  value={form.helper ?? ""}
                  onChange={(e) => setForm({ ...form, helper: e.target.value || undefined })}
                  className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                  placeholder="Additional context or instructions"
                />
              </div>

              <div>
                <label className="block text-label text-ink/55 mb-3">Field type</label>
                <div className="grid grid-cols-3 gap-2">
                  {FIELD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleFieldKindChange(type.value)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all",
                        form.field.kind === type.value
                          ? "border-ink bg-ink text-stone"
                          : "border-[var(--hairline)] text-ink hover:border-ink/40 hover:bg-ink/5"
                      )}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <p className="text-label mt-1">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {form.field.kind === "text" || form.field.kind === "email" || form.field.kind === "tel" ? (
                <div>
                  <label className="block text-label text-ink/55 mb-2">Placeholder</label>
                  <input
                    type="text"
                    value={form.field.placeholder ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        field: { ...form.field, placeholder: e.target.value || undefined },
                      })
                    }
                    className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                    placeholder="Placeholder text"
                  />
                </div>
              ) : null}

              {form.field.kind === "textarea" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label text-ink/55 mb-2">Placeholder</label>
                    <input
                      type="text"
                      value={form.field.placeholder ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          field: { ...form.field, placeholder: e.target.value || undefined },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                      placeholder="Placeholder text"
                    />
                  </div>
                  <div>
                    <label className="block text-label text-ink/55 mb-2">Rows</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={form.field.rows ?? 4}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          field: { ...form.field, rows: parseInt(e.target.value) || 4 },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {form.field.kind === "chips" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-label text-ink/55">Options</label>
                    <label className="flex items-center gap-2 text-label text-ink/65">
                      <input
                        type="checkbox"
                        checked={form.field.multiple ?? false}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            field: { ...form.field, multiple: e.target.checked },
                          })
                        }
                        className="rounded border-ink/30"
                      />
                      Allow multiple
                    </label>
                  </div>
                  <div className="space-y-2">
                    {options.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleUpdateOption(index, "label", e.target.value)}
                          placeholder="Label"
                          className="flex-1 rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                        />
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) => handleUpdateOption(index, "value", e.target.value)}
                          placeholder="Value"
                          className="w-32 rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink font-mono text-sm placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="size-8 inline-flex items-center justify-center rounded-lg text-ink/45 hover:text-terracotta hover:bg-terracotta/5 transition-colors"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="w-full rounded-xl border border-dashed border-[var(--hairline)] py-2 text-label text-ink/55 hover:border-ink/40 hover:text-ink transition-colors"
                    >
                      + Add option
                    </button>
                  </div>
                </div>
              )}

              {form.field.kind === "files" && (
                <div>
                  <label className="block text-label text-ink/55 mb-2">Accepted file types</label>
                  <input
                    type="text"
                    value={form.field.accept ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        field: { ...form.field, accept: e.target.value || undefined },
                      })
                    }
                    className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink font-mono placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                    placeholder=".pdf,.doc,.jpg,.png"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--hairline)]">
                <label className="flex items-center gap-2 text-label text-ink/75">
                  <input
                    type="checkbox"
                    checked={form.required ?? false}
                    onChange={(e) => setForm({ ...form, required: e.target.checked })}
                    className="rounded border-ink/30"
                  />
                  Required field
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-4 px-6 py-4 border-t border-[var(--hairline)] bg-stone/95 backdrop-blur-sm">
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-label text-terracotta hover:underline"
                >
                  Delete question
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors"
                >
                  Save question
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
