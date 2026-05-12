"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { WidgetConfig, WidgetType } from "./DashboardGrid";
import { cn } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType, size: "small" | "medium" | "large") => void;
  widgetInfo: Record<WidgetType, { label: string; description: string }>;
  currentWidgets: WidgetConfig[];
};

const WIDGET_ICONS: Record<WidgetType, string> = {
  quick_stats: "📊",
  intake_funnel: "📈",
  recent_projects: "📋",
  pipeline_distribution: "🎯",
};

export function AddWidgetModal({ isOpen, onClose, onAdd, widgetInfo, currentWidgets }: Props) {
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("medium");

  const handleAdd = () => {
    if (!selectedType) return;
    onAdd(selectedType, selectedSize);
    setSelectedType(null);
    setSelectedSize("medium");
  };

  const widgetTypes = Object.keys(widgetInfo) as WidgetType[];

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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-lg overflow-y-auto rounded-3xl bg-stone border border-[var(--hairline)] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--hairline)]">
              <h2 className="text-h3 text-ink">Add widget</h2>
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
              <div>
                <label className="block text-label text-ink/55 mb-3">Choose a widget</label>
                <div className="grid grid-cols-2 gap-3">
                  {widgetTypes.map((type) => {
                    const info = widgetInfo[type];
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={cn(
                          "text-left p-4 rounded-2xl border transition-all",
                          isSelected
                            ? "border-ink bg-ink/5"
                            : "border-[var(--hairline)] hover:border-ink/40"
                        )}
                      >
                        <span className="text-2xl">{WIDGET_ICONS[type]}</span>
                        <p className="text-body text-ink mt-2">{info.label}</p>
                        <p className="text-label text-ink/55 mt-0.5">{info.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <label className="block text-label text-ink/55 mb-3">Widget size</label>
                  <div className="flex gap-2">
                    {(["small", "medium", "large"] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "flex-1 py-2 rounded-xl border capitalize text-label transition-colors",
                          selectedSize === size
                            ? "border-ink bg-ink text-stone"
                            : "border-[var(--hairline)] text-ink/65 hover:border-ink/40"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--hairline)]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedType}
                className="rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
              >
                Add widget
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
