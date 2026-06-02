import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { GridPattern } from "@/components/ui/GridPattern";
import { PRODUCTS_HERO_IMAGE_DEFAULT } from "@/content/product-catalog";

type ProductsHeroProps = {
  eyebrow: string;
  headline: string;
  image?: string;
};

export function ProductsHero({ eyebrow, headline, image }: ProductsHeroProps) {
  const heroImage = image || PRODUCTS_HERO_IMAGE_DEFAULT;

  return (
    <section className="relative min-h-[75vh] overflow-hidden text-stone">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        draggable={false}
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/35 to-ink/20"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/80"
      />
      <div aria-hidden className="absolute inset-0 mix-blend-multiply bg-ink/[0.06]" />

      <GridPattern
        className="absolute inset-0 text-stone opacity-[0.07]"
        density={32}
        disruption
      />

      <div className="shell relative z-10 flex min-h-[75vh] flex-col justify-end pb-20 pt-40 md:pb-28 md:pt-44">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00" className="text-stone/80">
              {eyebrow}
            </Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  {headline}
                </SplitText>
              </span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
