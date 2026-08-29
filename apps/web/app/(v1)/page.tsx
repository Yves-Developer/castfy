import { PricingCards } from "@/features/home/cards";
import { HeroCover } from "@/features/home/cover";
import { HomeDemos } from "@/features/home/demos";
import HomeFaqs from "@/features/home/faqs";
import { HomeFeatures } from "@/features/home/features";
import { HomeHero } from "@/features/home/hero";
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
      <div className="container flex w-full flex-col gap-10" id="pricing">
        <h2 className="max-w-xl text-balance font-medium text-[28px] leading-7.75 tracking-[-0.04em] md:text-4xl md:leading-10 lg:text-[44px] lg:leading-12">
          Choose the package that fits your business
        </h2>
        <PricingCards />
      </div>

      <WhyCastfy />
      <HomeDemos />
      <HomeFaqs />
    </div>
  );
}
