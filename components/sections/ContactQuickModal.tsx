"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

type ContactQuickModalProps = {
  open: boolean;
  type: "email" | "phone" | null;
  email: string;
  phone: string;
  onClose: () => void;
};

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 7.5 12 13l8-5.5M6 18h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8.5 5.5h2l1.2 3-2 1.4c1.1 2.2 2.9 4 5.1 5.1l1.4-2 3 1.2v2c0 .6-.4 1-1 1.1-1 .2-2 .3-3 .3-6.1 0-11-4.9-11-11 0-1 .1-2 .3-3 .1-.6.5-1 1.1-1Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ContactQuickModal({
  open,
  type,
  email,
  phone,
  onClose,
}: ContactQuickModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const phoneHref = phone.replace(/\s/g, "");
  const isEmail = type === "email";

  return (
    <AnimatePresence>
      {open && type ? (
        <>
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeBrand }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-md backdrop-saturate-150"
          />
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-quick-modal-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.45, ease: easeBrand }}
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-[2px] border border-stone/15 bg-ink text-stone shadow-[0_40px_100px_-45px_rgba(0,0,0,0.75)]"
            >
              <div className="relative px-6 pt-6 pb-5 border-b border-stone/10">
                <div
                  aria-hidden
                  className="absolute -top-12 -right-8 h-28 w-28 rounded-full bg-stone/8 blur-3xl"
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-eyebrow text-stone/50">
                      / {isEmail ? "Email" : "Phone"}
                    </p>
                    <h2
                      id="contact-quick-modal-title"
                      className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.35rem,2vw,1.65rem)] font-light leading-[1.08] tracking-[-0.02em] text-stone"
                    >
                      {isEmail ? (
                        <>
                          Email
                          <span className="italic font-extralight"> the studio.</span>
                        </>
                      ) : (
                        <>
                          Contact
                          <span className="italic font-extralight"> the studio.</span>
                        </>
                      )}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-stone/15 text-stone/55 transition-colors hover:border-stone/30 hover:bg-stone/10 hover:text-stone"
                    aria-label="Close"
                  >
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start gap-3.5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stone/15 bg-stone/8 text-stone/80">
                    {isEmail ? (
                      <EmailIcon className="size-4" />
                    ) : (
                      <PhoneIcon className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-body text-stone/70 leading-relaxed">
                      {isEmail
                        ? "Reach the studio directly. We respond inside two working days."
                        : "Speak with the studio during working hours."}
                    </p>
                    <p className="mt-4 text-body font-light leading-relaxed break-all text-stone">
                      {isEmail ? email : phone}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={isEmail ? `mailto:${email}` : `tel:${phoneHref}`}
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2.5 rounded-full px-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group/btn",
                      "bg-stone text-ink hover:bg-stone/90",
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-ink transition-transform duration-500 group-hover/btn:scale-150" />
                    <span className="text-label">
                      {isEmail ? "Send email" : "Call now"}
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
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-stone/20 px-6 text-label text-stone/70 transition-colors hover:border-stone/35 hover:text-stone"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function ContactActionButton({
  label,
  onClick,
  icon,
  compact = false,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group w-full border-b border-stone/20 pb-4 text-left transition-colors hover:border-stone/40"
      >
        <span className="inline-flex size-9 align-middle items-center justify-center rounded-full border border-stone/25 bg-stone/8 text-stone/80 transition-all duration-500 group-hover:border-stone/45 group-hover:text-stone">
          {icon}
        </span>
        <span className="ml-3 align-middle font-[family-name:var(--font-display)] text-[0.95rem] font-light tracking-[-0.02em] text-stone/85 transition-colors group-hover:text-stone">
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full max-w-xs items-center gap-4 border-b border-stone/20 pb-5 text-left transition-colors hover:border-stone/40"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-stone/25 bg-stone/8 text-stone/80 transition-all duration-500 group-hover:border-stone/45 group-hover:bg-stone/12 group-hover:text-stone">
        {icon}
      </span>
      <span className="font-[family-name:var(--font-display)] text-[clamp(1.15rem,1.4vw,1.35rem)] font-light tracking-[-0.02em] text-stone/85 transition-colors group-hover:text-stone">
        {label}
      </span>
    </button>
  );
}

export function ContactActionButtons({
  onEmailClick,
  onPhoneClick,
  compact = false,
}: {
  onEmailClick: () => void;
  onPhoneClick: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-3" : "flex flex-col gap-8"}>
      <ContactActionButton
        label="Email us"
        onClick={onEmailClick}
        icon={<EmailIcon className="size-[18px]" />}
        compact={compact}
      />
      <ContactActionButton
        label="Contact us"
        onClick={onPhoneClick}
        icon={<PhoneIcon className="size-[18px]" />}
        compact={compact}
      />
    </div>
  );
}
