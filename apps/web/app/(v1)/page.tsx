import { HomeFeatures } from "@/features/home/features";
import { HomeHero } from "@/features/home/hero";
import { HomePricing } from "@/features/home/pricing";
export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col @md:gap-30 gap-20">
      <HomeHero />
      <HomeFeatures />
      <HomePricing />
    </div>
  );
}
