"use client";
import { features, featuresComing } from "@/config/data";
export function HomeFeatures() {
  return (
    <section className="container flex w-full flex-col gap-10" id="features">
      <h2 className="max-w-67.5 text-balance font-medium text-[28px] leading-7.75 tracking-[-0.04em] md:text-4xl md:leading-10 lg:text-[44px] lg:leading-12">
        What it does
      </h2>

      <div className="grid w-full max-w-container grid-cols-1 divide-x divide-y overflow-hidden rounded-2xl border md:grid-cols-2 2xl:grid-cols-3">
        {features.map((f) => (
          <div key={f.title}>
            <div className="relative z-10 flex w-full flex-col gap-5 p-5">
              <f.icon className="size-5" />
              <div className="flex flex-col gap-2 font-medium tracking-tight">
                <p className="font-medium text-lg">{f.title}</p>
                <p className="max-w-md text-muted-foreground">
                  {f.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">{featuresComing}</p>
    </section>
  );
}
