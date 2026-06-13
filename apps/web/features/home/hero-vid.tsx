"use client";
import Image from "next/image";
import { useState } from "react";
import lightCover from "@/public/images/dashboard-light.svg";
export default function HeroVid() {
  const [isDashboardLightLoaded, setIsDashboardLightLoaded] = useState(false);
  const [isDashboardDarkLoaded, setIsDashboardDarkLoaded] = useState(false);

  return (
    <div className="mt-8 mb-8 md:mt-12 lg:mt-0 lg:mb-4 3xl:mb-20 overflow-visible lg:w-full">
      <div className="relative overflow-hidden h-105 sm:h-130 md:h-150 lg:h-200  3xl:h-[1000px]">
        {/* Poster image with fade and blur effect */}
        <div
          className={`absolute inset-0 w-full  transition-all duration-1000 ease-in-out z-1
           
          `}
        >
          <Image
            src="https://cdn.midday.ai/video-poster-v2.jpg"
            alt="Midday dashboard preview"
            fill
            fetchPriority="high"
            quality={50}
            sizes="100vw"
            className="object-cover rounded-lg transition-all duration-1000 ease-in-out"
            priority
          />
        </div>

        {/* Dashboard overlay - different styles for mobile vs desktop */}
        <div className="absolute inset-0 flex items-center justify-center p-0 lg:p-4 z-2">
          <div className="relative lg:static scale-[0.95] md:scale-100 lg:scale-100 lg:h-full lg:flex lg:flex-col lg:items-center lg:justify-center">
            <Image
              src={lightCover}
              alt="Dashboard illustration"
              width={1600}
              height={1200}
              className="w-full h-auto rounded-lg md:scale-[0.85]! lg:scale-100! lg:object-contain lg:max-w-[85%] 2xl:max-w-[75%] block dark:hidden lg:transform-[rotate(-2deg)_skewY(1deg)] lg:filter-[drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] transition-all duration-700 ease-out"
              style={{
                filter: isDashboardLightLoaded
                  ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                  : "blur(20px)",
                transform: isDashboardLightLoaded ? "scale(1)" : "scale(1.02)",
              }}
              priority
              fetchPriority="high"
              onLoad={() => setIsDashboardLightLoaded(true)}
            />

            <Image
              src="/images/dashboard-dark.svg"
              alt="Dashboard illustration"
              width={1600}
              height={1200}
              className="w-full h-auto rounded-lg md:scale-[0.85]! lg:scale-100! lg:object-contain lg:max-w-[85%] 2xl:max-w-[75%] hidden dark:block lg:transform-[rotate(-2deg)_skewY(1deg)] lg:filter-[drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] transition-all duration-700 ease-out"
              style={{
                filter: isDashboardDarkLoaded
                  ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                  : "blur(20px)",
                transform: isDashboardDarkLoaded ? "scale(1)" : "scale(1.02)",
              }}
              priority
              fetchPriority="high"
              onLoad={() => setIsDashboardDarkLoaded(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
