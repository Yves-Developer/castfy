import { HeroCover } from "@/features/home/cover";
import HomeFaqs from "@/features/home/faqs";
import { HomeFeatures } from "@/features/home/features";
import { HomeHero } from "@/features/home/hero";
import { HomeProof } from "@/features/home/proof";
import { PricingCards } from "@/features/home/pricing";
import { HomeSteps } from "@/features/home/steps";
import { WhyCastfy } from "@/features/home/why";

export default function Home() {
  return (
    <div className="flex flex-col @md:gap-30 gap-20">
      <section
        className="container flex w-full flex-col gap-15 pt-25"
        id="hero"
      >
        <HomeHero />
        <HeroCover />
      </section>
      <HomeSteps />
      <HomeFeatures />
      <HomeProof />
      <div className="container flex w-full flex-col gap-10" id="pricing">
        <div className="flex max-w-xl flex-col gap-4">
          <h2 className="text-balance font-medium text-[28px] leading-7.75 tracking-[-0.04em] md:text-4xl md:leading-10 lg:text-[44px] lg:leading-12">
            One purchase. There’s no server to charge you rent for.
          </h2>
          <p className="text-muted-foreground">
            The render happens on your machine and the model cost is billed to
            your own provider, so there is nothing left for me to meter.
          </p>
        </div>
        <PricingCards />
      </div>

      <WhyCastfy />
      <HomeFaqs />
    </div>
  );
}
