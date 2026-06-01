"use client";
import Image from "next/image";
import { useState } from "react";

export default function HowItWork() {
  const [activeFeature, setActiveFeature] = useState(0);
  return (
    <section className="max-w-350 mx-auto">
      {/* Mobile: Stacked features */}
      <div className="grid grid-cols-1 gap-12 sm:gap-16 lg:hidden">
        <div className="hidden lg:block text-center mb-2">
          <h2 className="font-serif text-2xl sm:text-2xl text-foreground">
            How it works
          </h2>
        </div>
        {features.map((feature, index) => (
          <div key={index.toString()} className="space-y-6 sm:space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="font-serif text-2xl sm:text-2xl text-foreground max-w-md mx-auto">
                {feature.title}
              </h2>
              <p className="font-sans text-base text-muted-foreground leading-normal max-w-md mx-auto">
                <span className="sm:hidden">
                  {feature.mobileSubtitle || feature.subtitle}
                </span>
                <span className="hidden sm:inline">{feature.subtitle}</span>
              </p>
            </div>
            <div className="w-full border border-border overflow-hidden p-1 sm:p-3 relative">
              <div className="w-full h-130 sm:h-155 relative overflow-hidden flex items-center justify-center z-10">
                <div className="w-full h-full origin-center scale-[0.85] sm:scale-[0.90] lg:scale-[0.95]">
                  <Image
                    src={feature.illustration}
                    alt={feature.title}
                    width={600}
                    height={450}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Two-column interactive list + canvas */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 lg:h[740px]">
        <div className="flex gap-6">
          {/* Timeline */}
          <div className="flex flex-col justify-center items-center shrink-0 relative">
            <div className="flex flex-col justify-center space-y-5 lg:space-y-6 mt-2 lg:mt-3">
              <div
                className="flex items-center justify-center relative mb-4 lg:mb-6"
                style={{ minHeight: "3rem" }}
              />
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-start justify-center relative"
                  style={{ minHeight: "3.5rem" }}
                >
                  <button
                    onClick={() => setActiveFeature(index)}
                    className="cursor-pointer relative z-10"
                    style={{ marginTop: "0.125rem" }}
                    type="button"
                    aria-label={`Go to feature: ${feature.title}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-none transition-all duration-200 ease-out ${
                        activeFeature === index
                          ? "bg-primary scale-[1.2]"
                          : "bg-border hover:bg-muted-foreground scale-100"
                      }`}
                    />
                  </button>
                  {index < features.length - 1 && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-px border-l border-border"
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
          <div className="flex flex-col justify-center space-y-5 lg:space-y-6 flex-1">
            <div
              className="flex items-center mb-4 lg:mb-6"
              style={{ minHeight: "3rem" }}
            >
              <h2 className="font-serif text-2xl text-foreground">
                How it works
              </h2>
            </div>
            {features.map((feature, index) => (
              <button
                key={index.toString()}
                className={`cursor-pointer transition-all duration-300 flex items-start ${
                  activeFeature === index
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-80"
                }`}
                onClick={() => setActiveFeature(index)}
                style={{ minHeight: "3rem" }}
                type="button"
              >
                {activeFeature === index ? (
                  <div className="overflow-hidden text-left animate-[fadeInBlur_0.35s_ease-out_forwards]">
                    <h2 className="font-sans text-lg lg:text-xl text-primary transition-colors duration-300 max-w-md">
                      {feature.title}
                    </h2>
                    <p className="font-sans text-sm text-primary leading-relaxed max-w-md mt-1">
                      {feature.subtitle}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-sans text-lg lg:text-xl text-muted-foreground transition-colors duration-300 max-w-md">
                      {feature.title}
                    </h2>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center rounded-lg justify-center p-6 lg:p-8 border border-border h-full overflow-hidden relative bg-background">
          <div
            key={activeFeature}
            // className="w-[400px] h-[500px] sm:w-[520px]  lg:w-[600px]  relative overflow-hidden z-10 flex items-center justify-center animate-[fadeInScale_0.4s_ease-out_forwards]"
            className="w-100 h-125 sm:w-130   lg:w-150  relative overflow-hidden z-10 flex items-center justify-center animate-[fadeInScale_0.4s_ease-out_forwards]"
            style={{ transformOrigin: "center" }}
          >
            <div className="w-full h-full origin-center scale-[0.85] sm:scale-[0.90] lg:scale-[0.95]">
              <Image
                src={features[activeFeature]?.illustration ?? ""}
                alt={features[activeFeature]?.title ?? "Feature"}
                width={600}
                height={450}
                className="w-full h-full  object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Enter product url",
    subtitle:
      "Every payment in and out of the business is automatically synced from your connected accounts.",
    mobileSubtitle: "Every payment in and out is pulled in automatically.",
    illustration: "/images/dashboard-dark.svg",
  },
  {
    title: "Get demo",
    subtitle:
      "Customers can pay invoices online, with payments tracked automatically.",
    mobileSubtitle:
      "Customers can pay invoices online with payments tracked automatically.",
    illustration: "/images/dashboard-dark.svg",
  },
  {
    title: "Add your own final touch",
    subtitle:
      "Payments, receipts, and transactions are automatically matched so records stay accurate.",
    mobileSubtitle:
      "Transactions are categorized and reconciled automatically.",
    illustration: "/images/dashboard-dark.svg",
  },
];
