"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { easeBrand } from "@/lib/motion/easings";
import type { StartFormState } from "@/lib/start/schema";

/**
 * The "sealed letter" closing screen. Quiet by design — the work happened
 * in the letter; this is just the seal.
 */
export function LetterCompletion({ form }: { form: StartFormState }) {
  const firstName = form.name.trim().split(/\s+/)[0] || "Friend";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: easeBrand }}
      className="min-h-[100svh] bg-stone text-ink flex items-center"
    >
      <div className="shell max-w-3xl space-y-10">
        <Eyebrow number="∎">Sealed</Eyebrow>
        <h1 className="text-display leading-[0.95]">
          Thank you, {firstName}.
          <br />
          <span className="italic font-extralight">The studio has the letter.</span>
        </h1>
        <p className="text-body text-ink/75 max-w-xl">
          We read every brief by hand. You'll hear back within two working
          days from a member of the founding team — usually with a few
          sharper questions and a calendar.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <ButtonLink href="/" variant="ink">
            Back to the studio
          </ButtonLink>
          <Link
            href="/lookbook"
            className="text-label text-ink/55 hover:text-ink"
          >
            Browse the lookbook →
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
