"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@castfy/ui/components/accordion";
import { Button } from "@castfy/ui/components/button";
import { useState } from "react";

export function LoginAccordion({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Accordion
      className="w-full"
      collapsible
      onValueChange={(value) => setIsOpen(value === "item-1")}
      type="single"
      value={isOpen ? "item-1" : ""}
    >
      <AccordionItem className="border-0" value="item-1">
        <div className="flex items-center justify-center">
          <Button
            className="w-full"
            onClick={() => setIsOpen(!isOpen)}
            size="xl"
            type="button"
          >
            {isOpen ? "Hide other options" : "Show other options"}
          </Button>
        </div>
        <AccordionContent className="pt-4">
          <div className="space-y-3">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
