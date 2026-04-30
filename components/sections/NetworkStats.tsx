import { Eyebrow } from "@/components/ui/Eyebrow";
import { NumberCounter } from "@/components/ui/NumberCounter";
import { GridPattern } from "@/components/ui/GridPattern";
import { stats } from "@/content/manifesto";

export function NetworkStats() {
  return (
    <section className="relative bg-[var(--color-graphite-blue)] text-stone overflow-hidden">
      <GridPattern
        density={48}
        className="absolute inset-0 text-stone opacity-[0.08]"
        disruption
      />

      <div className="shell relative py-32 md:py-44">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="05" className="text-stone/70">
              Numbers
            </Eyebrow>
            <h2 className="text-h1 mt-6">
              Built on three decades
              <br />
              <span className="italic font-extralight">of textile know-how.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 md:col-start-8 self-end">
            <p className="text-body text-stone/75 max-w-md">
              Lineamode's founding team brings 30+ years of experience working
              with the world's most demanding brands. Our processes, our mill
              relationships and our discipline are inherited — not invented.
            </p>
          </div>
        </div>

        {/* 2-column layout so the giant figures get full breathing room
            on laptop and "100%" / "14 day" stop crowding each other. The
            four stats now read as two pairs (30+ / 5, then 100% / 14 day). */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:gap-x-16 md:gap-y-16 border-t border-stone/15 pt-10 md:pt-14">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-3 border-b border-stone/10 pb-8 md:border-b-0 md:pb-0"
            >
              <div className="text-display text-[clamp(3.25rem,9vw,8rem)] leading-[0.88] tabular-nums">
                <NumberCounter to={s.value} suffix={s.suffix} duration={1.8} />
              </div>
              <p className="text-label text-stone/70 max-w-[18ch]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
