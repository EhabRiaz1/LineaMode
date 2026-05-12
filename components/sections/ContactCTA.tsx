import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";

export function ContactCTA() {
  return (
    <section className="relative bg-[var(--color-terracotta)] text-stone py-32 md:py-44 overflow-hidden">
      <div className="shell relative">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="06" className="text-stone/80">
              Start a Project
            </Eyebrow>
          </div>

          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <h2 className="text-display leading-[0.95]">
              Tell us
              <br />
              <span className="italic font-extralight">what you're making.</span>
            </h2>
            <p className="text-body text-stone/85 max-w-md mt-8">
              We work with global brands of all sizes — from emerging labels
              with their first runs, to established houses scaling new
              divisions. Share what you're building and we'll come back inside
              two working days.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
              <Link href="mailto:saif@lineamode.com" className="block group/c">
                <p className="text-eyebrow text-stone/65 mb-2">Email</p>
                <p className="text-body group-hover/c:underline underline-offset-4">
                  saif@lineamode.com
                </p>
              </Link>
              <Link href="tel:+923001234567" className="block group/c">
                <p className="text-eyebrow text-stone/65 mb-2">Phone</p>
                <p className="text-body group-hover/c:underline underline-offset-4">
                  +92 300 1234567
                </p>
              </Link>
              <div>
                <p className="text-eyebrow text-stone/65 mb-2">Studio</p>
                <p className="text-body">Islamabad, Pakistan</p>
              </div>
            </div>

            <div className="mt-14">
              <ButtonLink href="/contact" variant="ink">
                Open the brief form
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
