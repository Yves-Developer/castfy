import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@castfy/ui/components/accordion";

const designs = [
  {
    value: "shadow",
    title: "Shadow",
    content: "shadow options",
  },
  {
    value: "style",
    title: "Style",
    content: "style options",
  },
  {
    value: "border",
    title: "Border",
    content: "border options",
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
            <AccordionContent>{background.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
