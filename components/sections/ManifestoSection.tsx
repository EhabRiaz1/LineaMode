import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { manifesto } from "@/content/manifesto";

export function ManifestoSection() {
  return (
    <section className="relative py-32 md:py-44">
      <div className="shell grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <Eyebrow number="02">The Studio</Eyebrow>
        </div>

        <div className="col-span-12 md:col-span-8 md:col-start-5">
          <p className="text-h1 leading-[1.05]">
            <SplitText by="word" stagger={0.025} duration={0.9}>
              {manifesto.short}
            </SplitText>
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl text-body text-ink/75">
            {manifesto.long.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
