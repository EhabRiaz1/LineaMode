import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { GridPattern } from "@/components/ui/GridPattern";
import { ContactForm } from "@/components/sections/ContactForm";
import { pageMetadata } from "@/lib/seo/metadata";
import { getContactContent } from "@/lib/cms";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Brief the studio. Tell us what you're making and we'll reply inside two working days with fabric, costing and an indicative critical path.",
  path: "/contact",
});

export default async function ContactPage() {
  const cms = await getContactContent();

  return (
    <>
      {/* Intro */}
      <section className="relative pt-40 pb-16 overflow-hidden">
        <GridPattern className="absolute inset-0 text-ink opacity-[0.05]" density={28} disruption />
        <div className="shell relative">
          <Eyebrow number="00">{cms.intro.eyebrow}</Eyebrow>
          <h1 className="text-contact-intro-headline mt-8 text-pretty">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  {cms.intro.headlineLine1}
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  {cms.intro.headlineLine2}
                </SplitText>
              </span>
            </h1>
        </div>
      </section>

      {/* Two-column: details + form */}
      <section className="relative pb-32">
        <div className="shell grid grid-cols-12 gap-6 md:gap-12">
          {/* Details */}
          <div className="col-span-12 md:col-span-4">
            <div className="md:sticky md:top-32 flex flex-col gap-10">
              <div>
                <p className="text-eyebrow text-ink/55 mb-3">/ 01 Email</p>
                <a
                  href={`mailto:${cms.details.email}`}
                  className="text-body leading-relaxed hover:underline underline-offset-4 break-all"
                >
                  {cms.details.email}
                </a>
              </div>
              <div>
                <p className="text-eyebrow text-ink/55 mb-3">/ 02 Location</p>
                <address className="not-italic text-body text-ink/85 leading-relaxed whitespace-pre-line">
                  {cms.details.address}
                </address>
              </div>
              <div>
                <p className="text-eyebrow text-ink/55 mb-3">/ 03 Hours</p>
                <p className="text-body text-ink/85">{cms.details.hours}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="col-span-12 md:col-span-8">
            <p className="text-eyebrow text-ink/55 mb-6">/ {cms.details.formSectionLabel}</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
