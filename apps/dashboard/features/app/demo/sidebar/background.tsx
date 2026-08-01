import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@castfy/ui/components/accordion";

const backgrounds = [
  {
    value: "light-shadow",
    title: "Light & Shadow",
    content: "Light & Shadow options",
  },
  {
    value: "custom",
    title: "Custom",
    content: "Custom options",
  },
  {
    value: "abstract",
    title: "Abstract",
    content: "Abstract options",
  },
  {
    value: "mac-os",
    title: "MacOs",
    content: "MacOs options",
  },
  {
    value: "radiant",
    title: "Radiant",
    content: "Radiant options",
  },
  {
    value: "mesh",
    title: "Mesh",
    content: "Mesh options",
  },
  {
    value: "raycast",
    title: "Raycast",
    content: "Raycast options",
  },
  {
    value: "paper",
    title: "Paper",
    content: "Paper options",
  },
  {
    value: "pattern",
    title: "Pattern",
    content: "Pattern options",
  },
  {
    value: "gradient",
    title: "Gradient",
    content: "Gradient options",
  },
];

export function BackgroundTab() {
  return (
    <div className="flex h-full flex-col">
      <Accordion collapsible defaultValue="light-shadow" type="single">
        {backgrounds.map((background) => (
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
