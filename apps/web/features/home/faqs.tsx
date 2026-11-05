import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@castfy/ui/components/accordion";
import { faqs } from "@/config/data";
export default function HomeFaqs() {
  return (
    <section id="faqs">
      <div className="mx-auto flex max-w-2xl flex-col gap-12">
        <h2 className="text-center text-h2">FAQ</h2>
        <div className="flex flex-col gap-10">
          <Accordion collapsible defaultValue={faqs[0].question} type="single">
            {faqs.map((f) => (
              <AccordionItem key={f.question} value={f.question}>
                <AccordionTrigger className="text-lg">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
