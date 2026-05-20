import { HomeFeatures } from "@/features/home/features";
import { HomeHero } from "@/features/home/hero";
import { HomePricing } from "@/features/home/pricing";
import HomeThumbnail from "@/features/home/thumbnail";
export default function Home() {
  return (
    <div className="flex flex-col @md:gap-30 gap-20">
      <HomeHero />
      <HomeThumbnail />
      <HomeFeatures />
      <HomePricing />
    </div>
  );
}
