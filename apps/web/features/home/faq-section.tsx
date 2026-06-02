"use client";

import { useState } from "react";
import { faqs } from "@/config/data";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 container sm:py-16 border-y lg:py-24" id="faqs">
      <div className="text-center space-y-4 mb-12">
        <h2 className="font-serif text-2xl sm:text-2xl text-foreground">
          Frequently asked questions
        </h2>
        <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal max-w-2xl mx-auto">
          Everything you need to know before getting started.
        </p>
      </div>

      <div className="max-w-3xl  w-full mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="border border-border rounded-lg  bg-background"
          >
            <button
              type="button"
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="font-sans text-sm text-foreground pr-6">
                {faq.question}
              </span>
              <span className="shrink-0 text-muted-foreground text-base">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
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
