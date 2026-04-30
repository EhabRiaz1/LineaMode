"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

const FIELD_BASE =
  "w-full bg-transparent border-b border-ink/20 focus:border-ink outline-none py-3 text-body placeholder:text-ink/40 transition-colors";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    { status: "idle" },
  );

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state.status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: easeBrand }}
            className="border-t border-b border-ink/20 py-16 text-center"
          >
            <p className="text-eyebrow text-ink/55 mb-6">Brief received</p>
            <p className="text-h1 leading-tight">
              Thank you.
              <br />
              <span className="italic font-extralight">We'll be in touch.</span>
            </p>
            <p className="text-body text-ink/70 mt-8 max-w-md mx-auto">
              The studio responds inside two working days. In the meantime,
              feel free to reply to your confirmation directly with
              attachments.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            action={formAction}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeBrand }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            noValidate
          >
            {/* Honeypot */}
            <input
              type="text"
              name="company_url"
              tabIndex={-1}
              autoComplete="off"
              className="sr-only"
              aria-hidden="true"
            />

            <Field
              label="Your name"
              name="name"
              placeholder="Saif Ahmed"
              error={fieldError(state, "name")}
            />
            <Field
              label="Brand"
              name="brand"
              placeholder="The label you're building"
              error={fieldError(state, "brand")}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@brand.com"
              error={fieldError(state, "email")}
            />
            <Field
              label="Product type"
              name="productType"
              placeholder="Knitwear, performance polyester, soft wovens…"
              error={fieldError(state, "productType")}
            />
            <Field
              label="MOQ (per style)"
              name="moq"
              placeholder="e.g. 200, 500, 1000+"
              optional
              error={fieldError(state, "moq")}
            />
            <Field
              label="Brief"
              name="message"
              placeholder="What you're making, what you need, when you need it."
              area
              className="md:col-span-2"
              error={fieldError(state, "message")}
            />

            {state.status === "error" && state.message && (
              <p className="md:col-span-2 text-label text-[var(--color-terracotta)]">
                {state.message}
              </p>
            )}

            <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-6">
              <p className="text-label text-ink/55 max-w-xs">
                By submitting you agree we may contact you about your brief.
              </p>
              <button
                type="submit"
                disabled={pending}
                className={cn(
                  "inline-flex items-center gap-3 rounded-full bg-ink text-stone h-14 px-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group/btn",
                  "disabled:opacity-50 disabled:cursor-wait",
                )}
              >
                <span className="size-1.5 rounded-full bg-stone transition-transform duration-500 group-hover/btn:scale-150" />
                <span className="text-label">
                  {pending ? "Sending…" : "Send brief"}
                </span>
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
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function fieldError(state: ContactState, name: string) {
  if (state.status !== "error") return undefined;
  return state.errors?.[name as keyof typeof state.errors];
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  area,
  optional,
  className,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  area?: boolean;
  optional?: boolean;
  className?: string;
  error?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-eyebrow text-ink/60 flex justify-between">
        {label}
        {optional && <span className="opacity-60">Optional</span>}
      </span>
      {area ? (
        <textarea
          name={name}
          rows={5}
          placeholder={placeholder}
          className={cn(FIELD_BASE, "resize-none")}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className={FIELD_BASE}
        />
      )}
      {error && <span className="text-label text-[var(--color-terracotta)]">{error}</span>}
    </label>
  );
}
