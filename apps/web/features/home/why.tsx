import { Button } from "@castfy/ui/components/button";
import { Separator } from "@castfy/ui/components/separator";
import { cn } from "@castfy/ui/lib/utils";
import { CheckIcon, OctagonXIcon } from "lucide-react";
import { comparisonData } from "@/config/data";

export function WhyCastfy() {
  return (
    <section className="container flex flex-col gap-10" id="why-us">
      <h2 className="text-center text-h2">Why teams switch to Castfy</h2>

      <div className="mx-auto grid max-w-4xl grid-cols-1 rounded-xl border md:grid-cols-2">
        {comparisonData.map((c, i) => (
          <div
            className={cn(
              "flex flex-1 flex-col gap-1.25 p-5",
              i === 1 && "border-y lg:border-x lg:border-y-0"
            )}
            key={c.title}
          >
            <div className="text-lg leading-6">
              <p>{c.title}</p>
              <p className="text-muted-foreground">{c.label}</p>
            </div>
            <div className="flex h-7.5 items-center">
              <Separator />
            </div>
            <ul className="flex flex-col gap-3">
              {c.items.map((item) => (
                <li
                  className="flex items-start gap-4 text-muted-foreground"
                  key={item}
                >
                  <span className="mt-1 shrink-0">
                    {c.type === "positive" ? (
                      <CheckIcon
                        className="size-4 text-blue-500"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <OctagonXIcon
                        className="size-4 text-red-500"
                        strokeWidth={2.5}
                      />
                    )}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {c.cta && (
              <div className="mt-auto pt-5">
                <Button asChild className="w-full" size="xl">
                  <a
                    href="https://waitlist.castfy.app"
                    rel="noopener"
                    target="_blank"
                  >
                    <span className="text-inherit text-sm">{c.cta}</span>
                  </a>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
