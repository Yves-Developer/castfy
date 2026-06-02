"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

export function LoginAccordion({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={isOpen ? "item-1" : ""}
      onValueChange={(value) => setIsOpen(value === "item-1")}
    >
      <AccordionItem value="item-1" className="border-0">
        <div className="flex items-center justify-center">
          <Button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full"
            size="xl"
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
