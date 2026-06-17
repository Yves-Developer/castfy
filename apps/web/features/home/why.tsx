import { Button } from "@castfy/ui/components/button";
import { Card, CardHeader, CardTitle } from "@castfy/ui/components/card";
import { comparisonData } from "@/config/data";

export function WhyCastfy() {
  return (
    <section className="container" id="why-us">
      <div className="mb-12 space-y-4 text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Why teams switch to Castfy
        </h2>
        <p className="hidden font-sans text-base text-muted-foreground leading-normal sm:block">
          The old way takes days. The Castfy way takes minutes.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {comparisonData.map((c) => (
          <div className="space-y-4" key={c.title}>
            <Card className="h-full">
              <CardHeader className="space-y-6 p-8">
                <CardTitle className="text-center font-medium text-2xl tracking-tight">
                  {c.title} - {c.label}
                </CardTitle>

                <div className="border-t" />

                <ul className="space-y-4">
                  {c.items.map((item) => (
                    <li
                      className="flex items-start gap-4 text-lg text-muted-foreground"
                      key={item}
                    >
                      <span className="mt-1 shrink-0">
                        {c.type === "positive" ? "✓" : "✕"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {c.cta && (
                  <Button asChild size="xl">
                    <a
                      href="https://waitlist.castfy.app"
                      rel="noopener"
                      target="_blank"
                    >
                      <span className="text-inherit text-sm">{c.cta}</span>
                    </a>
                  </Button>
                )}
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
