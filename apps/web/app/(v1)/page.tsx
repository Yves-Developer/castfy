import { HomeAgents } from "@/features/home/agents";
import HomeFaqs from "@/features/home/faqs";
import { FeatureTabs } from "@/features/home/feature-tabs";
import { HomeHero } from "@/features/home/hero";
import { HeroVideo } from "@/features/home/hero-video";
import { PageRails, Ruler } from "@/features/home/patterns";
import { HomePipeline } from "@/features/home/pipeline";
import { PricingCards } from "@/features/home/pricing";
import { HomeProof } from "@/features/home/proof";
import { StudioSpotlight } from "@/features/home/studio-spotlight";

export default function Home() {
  return (
    <div className="relative flex flex-col @md:gap-24 gap-16">
      <PageRails />
      <section
        className="container flex w-full flex-col gap-16 pt-20 md:pt-24"
        id="hero"
      >
        <HomeHero />
        <HeroVideo />
      </section>
      <Ruler />
      <HomeProof />
      <HomePipeline />
      <FeatureTabs />
      <StudioSpotlight />
      <Ruler from={60} />
      <HomeAgents />
      <div className="container flex w-full flex-col gap-10" id="pricing">
        <div className="mx-auto flex max-w-xl flex-col gap-4 text-center">
          <h2 className="text-h2">One purchase. Your machine.</h2>
          <p className="text-muted-foreground">
            The render runs on your machine and the model cost goes to the agent
            you already pay for.
          </p>
        </div>
        <PricingCards />
      </div>
      <HomeFaqs />
    </div>
  );
}
