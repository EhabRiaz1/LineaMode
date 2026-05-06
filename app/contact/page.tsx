import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { GridPattern } from "@/components/ui/GridPattern";
import { ContactForm } from "@/components/sections/ContactForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Brief the studio. Tell us what you're making and we'll reply inside two working days with fabric, costing and an indicative critical path.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      {/* Intro */}
      <section className="relative pt-40 pb-16 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-ink opacity-[0.05]"
          density={28}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00">Contact</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  Brief the studio.
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  We answer in two days.
                </SplitText>
              </span>
            </h1>
          </div>
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
                  href="mailto:saif@lineamode.com"
                  className="text-h2 leading-tight hover:underline underline-offset-4"
                >
                  saif@lineamode.com
                </a>
              </div>
              <div>
                <p className="text-eyebrow text-ink/55 mb-3">/ 02 Phone</p>
                <a
                  href="tel:+923001234567"
                  className="text-h2 leading-tight hover:underline underline-offset-4"
                >
                  +92 300 1234567
                </a>
              </div>
              <div>
                <p className="text-eyebrow text-ink/55 mb-3">/ 03 Studio</p>
                <address className="not-italic text-body text-ink/85 leading-relaxed">
                  1st Floor, NESPAK House,
                  <br />
                  G-5/2, Attaturk Avenue,
                  <br />
                  Islamabad, Pakistan.
                </address>
              </div>
              <div>
                <p className="text-eyebrow text-ink/55 mb-3">/ 04 Hours</p>
                <p className="text-body text-ink/85">
                  Mon — Fri · 09:00 to 18:00 PKT
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="col-span-12 md:col-span-8">
            <p className="text-eyebrow text-ink/55 mb-6">/ Project Brief</p>
            <ContactForm />
          </div>
        </div>
      </section>

    </>
  );
}
