"use client";

import { useState } from "react";
import { faqs } from "@/config/data";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="container border-y py-12 sm:py-16 lg:py-24" id="faqs">
      <div className="mb-12 space-y-4 text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto hidden max-w-2xl font-sans text-base text-muted-foreground leading-normal sm:block">
          Everything you need to know before getting started.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-4">
        {faqs.map((faq, index) => (
          <div
            className="rounded-lg border border-border bg-background"
            key={faq.question}
          >
            <button
              className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-muted/50 sm:p-4"
              onClick={() => toggleFAQ(index)}
              style={{ WebkitTapHighlightColor: "transparent" }}
              type="button"
            >
              <span className="pr-6 font-sans text-foreground text-sm">
                {faq.question}
              </span>
              <span className="shrink-0 text-base text-muted-foreground">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
