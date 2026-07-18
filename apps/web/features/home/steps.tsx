import { Badge } from "@castfy/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@castfy/ui/components/card";
import { steps } from "@/config/data";

export function Steps() {
  return (
    <section className="container" id="how">
      <div className="mb-12 space-y-4 text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          How it works
        </h2>
        <p className="hidden font-sans text-base text-muted-foreground leading-normal sm:block">
          Step by step, how your demo come to live.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <Card key={step.title}>
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">{i + 1}</Badge>
              </CardAction>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>
                <span className="hidden md:inline">{step.subtitle}</span>
                <span className="md:hidden">{step.mobileSubtitle}</span>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
