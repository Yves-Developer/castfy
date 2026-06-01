import { HomeCta } from "@/features/home/cta";
import { FAQSection } from "@/features/home/faq-section";
import { Hero } from "@/features/home/hero";
import HowItWork from "@/features/home/how-it-work";
import { PricingSection } from "@/features/home/pricing-section";
import { TestimonialsSection } from "@/features/home/testimonials-section";
import { UseCases } from "@/features/home/usecases";
export default function Home() {
  return (
    <div className="flex flex-col @md:gap-30 gap-20">
      <Hero />
      <HowItWork />
      <UseCases />
      <PricingSection />

      <FAQSection />

      <TestimonialsSection />
      <HomeCta />
    </div>
  );
}
