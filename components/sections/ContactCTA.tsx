"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm, ContactFormSuccess } from "@/components/sections/ContactForm";
import { ContactQuickModal, ContactActionButtons } from "@/components/sections/ContactQuickModal";
import { easeBrand } from "@/lib/motion/easings";
import { CONTACT_CTA_ID, getScrollOffsetForHashId } from "@/lib/navigation";

type ContactCtaCms = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  body?: string;
  email?: string;
  phone?: string;
};

export function ContactCTA({ cms }: { cms?: ContactCtaCms } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [activeModal, setActiveModal] = useState<"email" | "phone" | null>(null);
  const onSuccess = useCallback(() => setSubmitted(true), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  useLayoutEffect(() => {
    if (!submitted || !sectionRef.current) return;

    const offset = getScrollOffsetForHashId(CONTACT_CTA_ID);
    const top =
      sectionRef.current.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [submitted]);

  const eyebrow = cms?.eyebrow ?? "Start a Project";
  const headlineLine1 = cms?.headlineLine1 ?? "Tell us";
  const headlineLine2 = cms?.headlineLine2 ?? "what you're making.";
  const body =
    cms?.body ??
    "We work with global brands of all sizes — from emerging labels with their first runs, to established houses scaling new divisions. Share what you're building and we'll come back inside two working days.";
  const email = cms?.email ?? "saif@lineamode.com";
  const phone = cms?.phone ?? "+92 300 1234567";

  return (
    <>
      <section
        ref={sectionRef}
        id="contact-cta"
        className="relative bg-[var(--color-terracotta)] text-stone py-32 md:hidden overflow-hidden"
      >
        <div className="shell relative">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.7, ease: easeBrand }}
                className="max-w-3xl mx-auto"
              >
                <ContactFormSuccess tone="stone" layout="section" />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: easeBrand }}
              >
                <div className="grid grid-cols-12 gap-6 md:gap-12">
                  <div className="col-span-12 md:col-span-4">
                    <Eyebrow number="06" className="text-stone/80">
                      {eyebrow}
                    </Eyebrow>
                  </div>

                  <div className="col-span-12 md:col-span-8">
                    <h2 className="text-display md:text-[clamp(3rem,7vw+0.75rem,8.25rem)] leading-[0.95]">
                      {headlineLine1}
                      <br />
                      <span className="italic font-extralight">{headlineLine2}</span>
                    </h2>
                    <p className="text-body text-stone/85 max-w-md mt-8">{body}</p>
                  </div>

                  <div className="col-span-12">
                    <p className="text-eyebrow text-stone/70 mb-8">
                      / Tell us what you&apos;re making
                    </p>
                    <ContactForm
                      tone="stone"
                      successScope="section"
                      onSuccess={onSuccess}
                    />
                    <div className="mt-8">
                      <ContactActionButtons
                        compact
                        onEmailClick={() => setActiveModal("email")}
                        onPhoneClick={() => setActiveModal("phone")}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <ContactQuickModal
        open={activeModal !== null}
        type={activeModal}
        email={email}
        phone={phone}
        onClose={closeModal}
      />
    </>
  );
}
