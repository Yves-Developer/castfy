import { HomeCta } from "@/features/home/cta";
import { FAQSection } from "@/features/home/faq-section";
import { Hero } from "@/features/home/hero";
import { PricingSection } from "@/features/home/pricing-section";
import { Steps } from "@/features/home/steps";
import { WhyCastfy } from "@/features/home/why";

export default function Home() {
  return (
    <div className="flex flex-col @md:gap-30 gap-20">
      <Hero />
      <Steps />
      {/* <HowItWork /> */}
      {/* <UseCases /> */}
      <WhyCastfy />
      <PricingSection />

      <FAQSection />

      {/* <TestimonialsSection /> */}
      <HomeCta />
    </div>
  );
}
