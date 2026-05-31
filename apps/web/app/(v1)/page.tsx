import { Cta } from "@/features/_layout/cta";
import { HomeFaqs } from "@/features/home/faqs";
import { HomeHero } from "@/features/home/hero";
import { HowItWorks } from "@/features/home/how-it-works";
import { Pricing } from "@/features/home/pricing";
import { HomeTestimonials } from "@/features/home/testimonials";
import { UsaeCase } from "@/features/home/use-case";
export default function Home() {
  return (
    <div className="flex flex-col @md:gap-30 gap-20">
      <HomeHero />
      <HowItWorks />
      <UsaeCase />

      <Pricing />
      <HomeFaqs />
      <HomeTestimonials />
      <Cta
        desc="Turn your url into demo today."
        link={{ href: "/", label: "Get started" }}
        title="Get started with Castfy"
      />
    </div>
  );
}
