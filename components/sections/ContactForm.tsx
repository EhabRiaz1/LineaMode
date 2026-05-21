"use client";

import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useState,
  type ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

const FIELD_INK =
  "w-full bg-transparent border-b border-ink/20 focus:border-ink outline-none py-3 text-body text-ink placeholder:text-ink/40 transition-colors";

const FIELD_STONE =
  "w-full bg-transparent border-b border-stone/30 focus:border-stone outline-none py-3 text-body text-stone placeholder:text-stone/45 transition-colors";

type FormValues = {
  name: string;
  brand: string;
  email: string;
  productType: string;
  moq: string;
  message: string;
};

const EMPTY_VALUES: FormValues = {
  name: "",
  brand: "",
  email: "",
  productType: "",
  moq: "",
  message: "",
};

function getToneClasses(tone: "ink" | "stone") {
  return {
    successEyebrowClass: tone === "stone" ? "text-stone/55" : "text-ink/55",
    successBodyClass: tone === "stone" ? "text-stone/80" : "text-ink/70",
    successBorderClass: tone === "stone" ? "border-stone/30" : "border-ink/20",
  };
}

export function ContactFormSuccess({
  tone = "ink",
  layout = "inline",
}: {
  tone?: "ink" | "stone";
  layout?: "inline" | "section";
}) {
  const { successEyebrowClass, successBodyClass, successBorderClass } =
    getToneClasses(tone);

  const content = (
    <>
      <p className={cn("text-eyebrow mb-6", successEyebrowClass)}>Brief received</p>
      <p
        className={cn(
          "leading-tight",
          layout === "section" ? "text-display leading-[0.95]" : "text-h1 leading-tight",
        )}
      >
        Thank you.
        <br />
        <span className="italic font-extralight">We'll be in touch.</span>
      </p>
      <p
        className={cn(
          "text-body mt-8 mx-auto",
          layout === "section" ? "max-w-lg" : "max-w-md",
          successBodyClass,
        )}
      >
        The studio responds inside two working days. In the meantime, feel free
        to reply to your confirmation directly with attachments.
      </p>
    </>
  );

  if (layout === "section") {
    return (
      <div className="py-8 text-center md:py-16">{content}</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: easeBrand }}
      className={cn("border-t border-b py-16 text-center", successBorderClass)}
    >
      {content}
    </motion.div>
  );
}

export function ContactForm({
  tone = "ink",
  onSuccess,
  successScope = "inline",
}: {
  tone?: "ink" | "stone";
  onSuccess?: () => void;
  successScope?: "inline" | "section";
}) {
  const fieldClass = tone === "stone" ? FIELD_STONE : FIELD_INK;
  const labelClass = tone === "stone" ? "text-stone/70" : "text-ink/60";
  const finePrintClass = tone === "stone" ? "text-stone/60" : "text-ink/55";
  const errorClass =
    tone === "stone" ? "text-stone" : "text-[var(--color-terracotta)]";
  const buttonClass =
    tone === "stone"
      ? "inline-flex items-center gap-3 rounded-full bg-stone text-ink h-14 px-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group/btn"
      : "inline-flex items-center gap-3 rounded-full bg-ink text-[var(--color-stone-veil)] h-14 px-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group/btn";
  const buttonDotClass =
    tone === "stone"
      ? "size-1.5 rounded-full bg-ink transition-transform duration-500 group-hover/btn:scale-150"
      : "size-1.5 rounded-full bg-[var(--color-stone-veil)] transition-transform duration-500 group-hover/btn:scale-150";
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    { status: "idle" },
  );

  useEffect(() => {
    if (state.status !== "error" || !state.values) return;
    setValues((prev) => ({ ...prev, ...state.values }));
  }, [state]);

  useLayoutEffect(() => {
    if (state.status === "success" && successScope === "section") {
      onSuccess?.();
    }
  }, [onSuccess, state.status, successScope]);

  const updateField =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  if (state.status === "success") {
    if (successScope === "section") return null;
    return (
      <div className="relative">
        <ContactFormSuccess tone={tone} />
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
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
              value={values.name}
              onChange={updateField("name")}
              error={fieldError(state, "name")}
              fieldClass={fieldClass}
              labelClass={labelClass}
              errorClass={errorClass}
            />
            <Field
              label="Brand"
              name="brand"
              placeholder="The label you're building"
              value={values.brand}
              onChange={updateField("brand")}
              error={fieldError(state, "brand")}
              fieldClass={fieldClass}
              labelClass={labelClass}
              errorClass={errorClass}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@brand.com"
              value={values.email}
              onChange={updateField("email")}
              error={fieldError(state, "email")}
              fieldClass={fieldClass}
              labelClass={labelClass}
              errorClass={errorClass}
            />
            <Field
              label="Product type"
              name="productType"
              placeholder="Knitwear, performance polyester, soft wovens…"
              value={values.productType}
              onChange={updateField("productType")}
              error={fieldError(state, "productType")}
              fieldClass={fieldClass}
              labelClass={labelClass}
              errorClass={errorClass}
            />
            <Field
              label="MOQ (per style)"
              name="moq"
              placeholder="e.g. 200, 500, 1000+"
              optional
              value={values.moq}
              onChange={updateField("moq")}
              error={fieldError(state, "moq")}
              fieldClass={fieldClass}
              labelClass={labelClass}
              errorClass={errorClass}
            />
            <Field
              label="Brief"
              name="message"
              placeholder="What you're making, what you need, when you need it."
              area
              className="md:col-span-2"
              value={values.message}
              onChange={updateField("message")}
              error={fieldError(state, "message")}
              fieldClass={fieldClass}
              labelClass={labelClass}
              errorClass={errorClass}
            />

            {state.status === "error" && state.message && (
              <p className={cn("md:col-span-2 text-label", errorClass)}>
                {state.message}
              </p>
            )}

            <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-6">
              <p className={cn("text-label max-w-xs", finePrintClass)}>
                By submitting you agree we may contact you about your brief.
              </p>
              <button
                type="submit"
                disabled={pending}
                className={cn(
                  buttonClass,
                  "disabled:opacity-50 disabled:cursor-wait",
                )}
              >
                <span className={buttonDotClass} />
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
  value,
  onChange,
  error,
  fieldClass,
  labelClass,
  errorClass,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  area?: boolean;
  optional?: boolean;
  className?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  fieldClass: string;
  labelClass: string;
  errorClass: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className={cn("text-eyebrow flex justify-between", labelClass)}>
        {label}
        {optional && <span className="opacity-60">Optional</span>}
      </span>
      {area ? (
        <textarea
          name={name}
          rows={5}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(fieldClass, "resize-none")}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={fieldClass}
        />
      )}
      {error && <span className={cn("text-label", errorClass)}>{error}</span>}
    </label>
  );
}
