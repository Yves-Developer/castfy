import type { Metadata } from "next";
import { preload } from "react-dom";
import { faqs, pricing } from "@/config/data";
import { siteConfig } from "@/config/site";
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

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * For search engines: Castfy as an app with its price, and the FAQ, which
 * can show as expandable answers under the result.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "macOS, Windows, Linux",
    offers: {
      "@type": "Offer",
      price: pricing.paid.price.replace("$", ""),
      priceCurrency: "USD",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  },
];

export default function Home() {
  // The hero video's still is the largest thing on the first screen; start
  // it with the HTML instead of after the CSS and scripts.
  preload("/hero/castfy-hero-poster.webp", {
    as: "image",
    fetchPriority: "high",
  });
  return (
    <div className="relative flex flex-col">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from our own config
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
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
