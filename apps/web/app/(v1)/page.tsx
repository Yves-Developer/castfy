import { HomeFeatures } from "@/features/home/features";
import { HomeHero } from "@/features/home/hero";
import { Pricing } from "@/features/home/pricing";
export default function Home() {
  return (
    <div className="flex flex-col @md:gap-30 gap-20">
      <HomeHero />
      <HomeFeatures />
      <Pricing />
    </div>
  );
}
