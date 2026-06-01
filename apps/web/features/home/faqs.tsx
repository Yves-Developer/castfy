import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { homeFaqs } from "@/config/data";

export function HomeFaqs() {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2" id="faqs">
      <div className="pt-12 pb-6 md:px-4">
        <div className="space-y-5">
          <h2 className="text-balance font-medium text-3xl md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="font-medium text-muted-foreground text-sm">
            For other question,{" "}
            <Link className="underline underline-offset-4" href="/">
              Contact Sales
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="relative place-content-center md:pr-4">
        {/* vertical guide line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 h-full w-px bg-border"
        />

        <Accordion collapsible type="single">
          {homeFaqs.map((item) => (
            <AccordionItem
              className="group relative border-b pl-5"
              key={item.value}
              value={item.value}
            >
              {/*  plus */}
              <PlusIcon
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-5.5px] left-[12.5px] size-2.5 -translate-x-1/2 text-muted-foreground group-last:hidden"
              />

              <AccordionTrigger className="px-4 py-4 font-normal text-base leading-6 hover:no-underline">
                {item.question}
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
