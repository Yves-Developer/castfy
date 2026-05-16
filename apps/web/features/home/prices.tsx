"use client";

import {
  ArrowUpDownIcon,
  ArrowUpRightIcon,
  LayoutPanelTopIcon,
  TimerIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

const pricingInfo = [
  {
    title: "Project Scope",
    description:
      "Pricing depends on the size, features, and complexity of your project.",
    icon: ArrowUpDownIcon,
    link: {
      href: "/contact-sales",
      label: "Learn more",
    },
  },
  {
    title: "Delivery Time",
    description:
      "Urgent projects or shorter deadlines may require additional resources and pricing.",
    icon: TimerIcon,
    link: {
      href: "/contact-sales",
      label: "Learn more",
    },
  },
  {
    title: "Custom Design",
    description:
      "Pricing may vary depending on whether you choose a custom design or a ready-made template.",
    icon: LayoutPanelTopIcon,
    link: {
      href: "/marketplace",
      label: "Explore",
    },
  },
];

export function HomePricing() {
  return (
    <section className="w-full space-y-10" id="pricing">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-balance font-medium text-xl leading-6 md:text-2xl">
          Pricing
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Flexible pricing that fits your business needs. Pay for exactly what
          you have.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {pricingInfo.map((item) => (
          <div
            className="flex flex-col gap-4 rounded-lg bg-secondary/50 p-6 lg:gap-5"
            key={item.title}
          >
            <item.icon className="size-6 lg:size-8" />
            <p className="font-medium text-lg">{item.title}</p>
            <p className="leading-7">{item.description}</p>
            <Link
              className="mt-auto inline-flex items-center gap-1 underline not-visited:not-target:decoration-foreground underline-offset-4"
              href={item.link.href as Route}
            >
              {item.link.label}
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
