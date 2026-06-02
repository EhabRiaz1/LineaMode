import { ButtonLink } from "@/components/ui/Button";
import { CONTACT_FORM_HREF } from "@/lib/navigation";

type ProductsCtaProps = {
  headlineLine1: string;
  headlineLine2: string;
  body: string;
  contactCta: { label: string; href: string };
};

export function ProductsCta({ headlineLine1, headlineLine2, body, contactCta }: ProductsCtaProps) {
  const href = contactCta.href || CONTACT_FORM_HREF;

  return (
    <section className="bg-[var(--color-terracotta)] text-stone py-32">
      <div className="shell grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-7">
          <h2 className="text-display leading-[0.95]">
            {headlineLine1}
            <br />
            <span className="italic font-extralight">{headlineLine2}</span>
          </h2>
        </div>
        <div className="col-span-12 md:col-span-4">
          <p className="text-body text-stone/85 max-w-md mb-8">{body}</p>
          <ButtonLink href={href} variant="ink">
            {contactCta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
