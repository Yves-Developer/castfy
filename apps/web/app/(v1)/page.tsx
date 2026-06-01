import { HomeFaqs } from "@/features/home/faqs";
import { Hero } from "@/features/home/hero";
import HowItWork from "@/features/home/how-it-work";
import { Pricing } from "@/features/home/pricing";
import { TestimonialsSection } from "@/features/home/testimonials-section";
import { UseCases } from "@/features/home/usecases";
export default function Home() {
  return (
    <div className="flex flex-col @md:gap-30 gap-20">
      <Hero />
      <HowItWork />
      <UseCases />
      <Pricing />
      <HomeFaqs />
      <TestimonialsSection />
    </div>
  );
}
