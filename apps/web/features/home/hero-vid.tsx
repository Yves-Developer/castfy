"use client";
import Image from "next/image";
import { useState } from "react";
import lightCover from "@/public/dev_cover.png";
export default function HeroVid() {
  const [isDashboardLightLoaded, setIsDashboardLightLoaded] = useState(false);

  return (
    <div className="mt-8 3xl:mb-20 mb-8 overflow-visible md:mt-12 lg:mt-0 lg:mb-4 lg:w-full">
      <div className="relative 3xl:h-[1000px] h-105 overflow-hidden sm:h-130 md:h-150 lg:h-200">
        {/* Poster image with fade and blur effect */}
        <div
          className={
            "absolute inset-0 z-1 w-full transition-all duration-1000 ease-in-out"
          }
        >
          <Image
            alt="Midday dashboard preview"
            className="rounded-lg object-cover transition-all duration-1000 ease-in-out"
            fetchPriority="high"
            fill
            priority
            quality={50}
            sizes="100vw"
            src="https://cdn.midday.ai/video-poster-v2.jpg"
          />
        </div>

        {/* Dashboard overlay - different styles for mobile vs desktop */}
        <div className="absolute inset-0 z-2 flex items-center justify-center p-0 lg:p-4">
          <div className="relative scale-[0.95] md:scale-100 lg:static lg:flex lg:h-full lg:scale-100 lg:flex-col lg:items-center lg:justify-center">
            <Image
              alt="Dashboard illustration"
              className="lg:transform-[rotate(-2deg)_skewY(1deg)] lg:filter-[drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] h-auto w-full rounded-lg transition-all duration-700 ease-out md:scale-[0.85]! lg:max-w-[85%] lg:scale-100! lg:object-contain 2xl:max-w-[75%]"
              fetchPriority="high"
              height={1200}
              onLoad={() => setIsDashboardLightLoaded(true)}
              priority
              src={lightCover}
              style={{
                filter: isDashboardLightLoaded
                  ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                  : "blur(20px)",
                transform: isDashboardLightLoaded ? "scale(1)" : "scale(1.02)",
              }}
              width={1600}
            />

            {/* <Image
              src="/images/dash"
              alt="Dashboard illustration"
              width={1600}
              height={1200}
              className="w-full  h-auto rounded-lg md:scale-[0.85]! lg:scale-100! lg:object-contain lg:max-w-[85%] 2xl:max-w-[75%] hidden dark:block lg:transform-[rotate(-2deg)_skewY(1deg)] lg:filter-[drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] transition-all duration-700 ease-out"
              style={{
                filter: isDashboardDarkLoaded
                  ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                  : "blur(20px)",
                transform: isDashboardDarkLoaded ? "scale(1)" : "scale(1.02)",
              }}
              priority
              fetchPriority="high"
              onLoad={() => setIsDashboardDarkLoaded(true)}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
