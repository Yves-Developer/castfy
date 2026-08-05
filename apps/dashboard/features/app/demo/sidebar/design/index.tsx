import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@castfy/ui/components/accordion";
import { BorderSection } from "./border-selection";
import { BrowserMockupSection } from "./browser-mockup";
import { ShadowSection } from "./shadow-section";
import { StyleSection } from "./style-selection";

const designs = [
  {
    value: "style",
    title: "Style",
    content: <StyleSection />,
  },
  {
    value: "border",
    title: "Border",
    content: <BorderSection />,
  },
  {
    value: "browser",
    title: "Browser",
    content: <BrowserMockupSection />,
  },
  {
    value: "shadow",
    title: "Shadow",
    content: <ShadowSection />,
  },
];
export function DesignTab() {
  return (
    <div className="flex h-full flex-col">
      <Accordion collapsible defaultValue="light-shadow" type="single">
        {designs.map((background) => (
          <AccordionItem key={background.value} value={background.value}>
            <AccordionTrigger className="text-foreground hover:no-underline data-[state=closed]:text-muted-foreground">
              {background.title}
            </AccordionTrigger>
            <AccordionContent className="h-full">
              {background.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
