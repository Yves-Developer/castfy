import { Button } from "@castfy/ui/components/button";
import { comparison } from "@/config/data";
import { siteConfig } from "@/config/site";

export function WhyCastfy() {
  return (
    <section className="container flex flex-col gap-10" id="why-us">
      <div className="flex max-w-xl flex-col gap-4">
        <h2 className="text-h2">Against a hosted demo tool</h2>
        <p className="text-muted-foreground">
          The other tools in this category are good. They all run your product
          on their infrastructure, which decides what they can and cannot reach.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-160 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 font-medium text-muted-foreground">{""}</th>
              <th className="p-4 font-medium text-muted-foreground">
                Cloud demo tools
              </th>
              <th className="p-4 font-medium">Castfy</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr className="border-b last:border-b-0" key={row.axis}>
                <td className="p-4 text-muted-foreground">{row.axis}</td>
                <td className="p-4 text-muted-foreground">{row.cloud}</td>
                <td className="p-4 font-medium">{row.castfy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <Button asChild size="lg">
          <a href={siteConfig.waitlistUrl} rel="noopener" target="_blank">
            <span className="text-inherit text-sm">Join the waitlist</span>
          </a>
        </Button>
      </div>
    </section>
  );
}
