import { HomeAgents } from "@/features/home/agents";
import { Band } from "@/features/home/band";
import { HomeCommunity } from "@/features/home/community";
import HomeFaqs from "@/features/home/faqs";
import { FeatureTabs } from "@/features/home/feature-tabs";
import { HomeHero } from "@/features/home/hero";
import { HeroScroll } from "@/features/home/hero-scroll";
import { HeroVideo } from "@/features/home/hero-video";
import { PageRails } from "@/features/home/patterns";
import { HomePipeline } from "@/features/home/pipeline";
import { PricingCards } from "@/features/home/pricing";
import { HomeProof } from "@/features/home/proof";
import { ProofLine } from "@/features/home/proof-line";
import { StudioSpotlight } from "@/features/home/studio-spotlight";

export default function Home() {
  return (
    <div className="relative flex flex-col">
      <PageRails />
      <HeroScroll>
        <HomeHero />
        <HeroVideo />
      </HeroScroll>
      <HomeProof />
      <HomePipeline />
      <FeatureTabs />
      <StudioSpotlight />
      <ProofLine />
      <HomeAgents />
      <HomeCommunity />
      <Band id="pricing" soft>
        <div className="flex flex-col gap-12">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
            <h2 className="text-h2">One purchase. Your machine.</h2>
            <p className="text-sub">
              The render runs on your machine and the model cost goes to the
              agent you already pay for.
            </p>
          </div>
          <PricingCards />
        </div>
      </Band>
      <Band>
        <HomeFaqs />
      </Band>
    </div>
  );
}
