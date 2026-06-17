import { Button } from "@castfy/ui/components/button";
import { Card, CardHeader, CardTitle } from "@castfy/ui/components/card";
import { comparisonData } from "@/config/data";

export function WhyCastfy() {
  return (
    <section className=" container " id="pricing">
      <div className="text-center space-y-4 mb-12">
        <h2 className="font-serif text-3xl sm:text-4xl text-foreground">
          Why teams switch to Castfy
        </h2>
        <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal">
          The old way takes days. The Castfy way takes minutes.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {comparisonData.map((c) => (
          <div key={c.title} className="space-y-4">
            <Card className="h-full">
              <CardHeader className="space-y-6 p-8 ">
                <CardTitle className="text-center text-2xl font-medium tracking-tight">
                  {c.title} - {c.label}
                </CardTitle>

                <div className="border-t" />

                <ul className="space-y-4">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-4 text-lg text-muted-foreground"
                    >
                      <span className="mt-1 shrink-0">
                        {c.type === "positive" ? "✓" : "✕"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {c.cta && (
                  <Button size="xl" asChild>
                    <a
                      href="https://waitlist.castfy.app"
                      target="_blank"
                      rel="noopener"
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
