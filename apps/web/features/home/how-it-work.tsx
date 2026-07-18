"use client";
import Image from "next/image";
import { useState } from "react";
import { steps } from "@/config/data";

export default function HowItWork() {
  const [activeFeature, setActiveFeature] = useState(0);
  return (
    <section className="container" id="features">
      {/* Mobile: Stacked features */}
      <div className="grid grid-cols-1 gap-12 sm:gap-16 lg:hidden">
        <div className="mb-2 hidden text-center lg:block">
          <h2 className="font-serif text-2xl text-foreground sm:text-2xl">
            How it works
          </h2>
        </div>
        {steps.map((feature, index) => (
          <div className="space-y-6 sm:space-y-8" key={index.toString()}>
            <div className="space-y-2 text-center">
              <h2 className="mx-auto max-w-md font-serif text-2xl text-foreground sm:text-2xl">
                {feature.title}
              </h2>
              <p className="mx-auto max-w-md font-sans text-base text-muted-foreground leading-normal">
                <span className="sm:hidden">
                  {feature.mobileSubtitle || feature.subtitle}
                </span>
                <span className="hidden sm:inline">{feature.subtitle}</span>
              </p>
            </div>
            <div className="relative w-full overflow-hidden border border-border p-1 sm:p-3">
              <div className="relative z-10 flex h-130 w-full items-center justify-center overflow-hidden sm:h-155">
                <div className="h-full w-full origin-center scale-[0.85] sm:scale-[0.90] lg:scale-[0.95]">
                  <Image
                    alt={feature.title}
                    className="h-full w-full object-contain"
                    height={450}
                    loading="lazy"
                    src={feature.illustration}
                    width={600}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Two-column interactive list + canvas */}
      <div className="lg:h[740px] hidden grid-cols-1 gap-8 lg:grid lg:grid-cols-2 lg:gap-16">
        <div className="flex gap-6">
          {/* Timeline */}
          <div className="relative flex shrink-0 flex-col items-center justify-center">
            <div className="mt-2 flex flex-col justify-center space-y-5 lg:mt-3 lg:space-y-6">
              <div
                className="relative mb-4 flex items-center justify-center lg:mb-6"
                style={{ minHeight: "3rem" }}
              />
              {steps.map((feature, index) => (
                <div
                  className="relative flex items-start justify-center"
                  key={feature.title}
                  style={{ minHeight: "3.5rem" }}
                >
                  <button
                    aria-label={`Go to feature: ${feature.title}`}
                    className="relative z-10 cursor-pointer"
                    onClick={() => setActiveFeature(index)}
                    style={{ marginTop: "0.125rem" }}
                    type="button"
                  >
                    <div
                      className={`h-2 w-2 rounded-none transition-all duration-200 ease-out ${
                        activeFeature === index
                          ? "scale-[1.2] bg-primary"
                          : "scale-100 bg-border hover:bg-muted-foreground"
                      }`}
                    />
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className="absolute left-1/2 w-px -translate-x-1/2 border-border border-l"
                      style={{
                        height: "calc(3.5rem + 1.25rem - 0.25rem)",
                        top: "0.375rem",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-1 flex-col justify-center space-y-5 lg:space-y-6">
            <div
              className="mb-4 flex items-center lg:mb-6"
              style={{ minHeight: "3rem" }}
            >
              <h2 className="font-serif text-2xl text-foreground">
                How it works
              </h2>
            </div>
            {steps.map((feature, index) => (
              <button
                className={`flex cursor-pointer items-start transition-all duration-300 ${
                  activeFeature === index
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-80"
                }`}
                key={index.toString()}
                onClick={() => setActiveFeature(index)}
                style={{ minHeight: "3rem" }}
                type="button"
              >
                {activeFeature === index ? (
                  <div className="animate-[fadeInBlur_0.35s_ease-out_forwards] overflow-hidden text-left">
                    <h2 className="max-w-md font-sans text-lg text-primary transition-colors duration-300 lg:text-xl">
                      {feature.title}
                    </h2>
                    <p className="mt-1 max-w-md font-sans text-primary text-sm leading-relaxed">
                      {feature.subtitle}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="max-w-md font-sans text-lg text-muted-foreground transition-colors duration-300 lg:text-xl">
                      {feature.title}
                    </h2>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background p-6 lg:p-8">
          <div
            // className="w-[400px] h-[500px] sm:w-[520px]  lg:w-[600px]  relative overflow-hidden z-10 flex items-center justify-center animate-[fadeInScale_0.4s_ease-out_forwards]"
            className="relative z-10 flex h-125 w-100 animate-[fadeInScale_0.4s_ease-out_forwards] items-center justify-center overflow-hidden sm:w-130 lg:w-150"
            key={activeFeature}
            style={{ transformOrigin: "center" }}
          >
            <div className="h-full w-full origin-center scale-[0.85] sm:scale-[0.90] lg:scale-[0.95]">
              <Image
                alt={steps[activeFeature]?.title ?? "Feature"}
                className="h-full w-full object-contain"
                height={450}
                loading="lazy"
                src={steps[activeFeature]?.illustration ?? ""}
                width={600}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
