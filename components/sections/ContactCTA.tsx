import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";

type Cta = { label: string; href: string };

type ContactCtaCms = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  body?: string;
  email?: string;
  phone?: string;
  studio?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

export function ContactCTA({ cms }: { cms?: ContactCtaCms } = {}) {
  const eyebrow = cms?.eyebrow ?? "Start a Project";
  const headlineLine1 = cms?.headlineLine1 ?? "Tell us";
  const headlineLine2 = cms?.headlineLine2 ?? "what you're making.";
  const body =
    cms?.body ??
    "We work with global brands of all sizes — from emerging labels with their first runs, to established houses scaling new divisions. Share what you're building and we'll come back inside two working days.";
  const email = cms?.email ?? "saif@lineamode.com";
  const phone = cms?.phone ?? "+92 300 1234567";
  const studio = cms?.studio ?? "Islamabad, Pakistan";
  const primaryCta = cms?.primaryCta ?? { label: "Brief the studio", href: "/start" };
  const secondaryCta = cms?.secondaryCta ?? { label: "Contact", href: "/contact" };

  return (
    <section className="relative bg-[var(--color-terracotta)] text-stone py-32 md:py-44 overflow-hidden">
      <div className="shell relative">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="06" className="text-stone/80">
              {eyebrow}
            </Eyebrow>
          </div>

          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <h2 className="text-display leading-[0.95]">
              {headlineLine1}
              <br />
              <span className="italic font-extralight">{headlineLine2}</span>
            </h2>
            <p className="text-body text-stone/85 max-w-md mt-8">{body}</p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
              <Link href={`mailto:${email}`} className="block group/c">
                <p className="text-eyebrow text-stone/65 mb-2">Email</p>
                <p className="text-body group-hover/c:underline underline-offset-4">{email}</p>
              </Link>
              <Link href={`tel:${phone.replace(/\s/g, "")}`} className="block group/c">
                <p className="text-eyebrow text-stone/65 mb-2">Phone</p>
                <p className="text-body group-hover/c:underline underline-offset-4">{phone}</p>
              </Link>
              <div>
                <p className="text-eyebrow text-stone/65 mb-2">Studio</p>
                <p className="text-body">{studio}</p>
              </div>
            </div>

            <div className="mt-14 flex flex-wrap gap-3">
              <ButtonLink href={primaryCta.href} variant="ink">
                {primaryCta.label}
              </ButtonLink>
              <ButtonLink
                href={secondaryCta.href}
                variant="ghost"
                className="!text-stone ring-stone/45 hover:bg-stone/10"
              >
                {secondaryCta.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
