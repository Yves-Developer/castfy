import { Button } from "@castfy/ui/components/button";
import { proof } from "@/config/data";
import { siteConfig } from "@/config/site";
import { PanelEdge } from "./patterns";

export function HomeProof() {
  return (
    <section className="container" id="proof">
      <div className="text-[#fbf1e1] dark:text-[#2a2216]">
        <div className="rounded-t-2xl bg-current px-4 py-10 md:px-12 md:py-14">
          <div className="flex flex-col gap-10 text-foreground">
            <div className="flex max-w-xl flex-col gap-4">
              <h2 className="text-h2">The numbers. Even the ugly one.</h2>
              <p className="text-muted-foreground">
                Seven recordings, measured on disk. The compression is real and
                so is the spread.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 font-medium text-muted-foreground">
                        Recording
                      </th>
                      <th className="p-4 font-medium text-muted-foreground">
                        Raw
                      </th>
                      <th className="p-4 font-medium">Finished</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proof.rows.map((row) => (
                      <tr className="border-b last:border-b-0" key={row.label}>
                        <td className="p-4 text-muted-foreground">
                          {row.label}
                        </td>
                        <td className="p-4 text-destructive">{row.raw}</td>
                        <td className="p-4 font-medium text-brand">
                          {row.cut}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col justify-center gap-5">
                <p className="text-muted-foreground leading-6">
                  {proof.caveat}
                </p>
                <p className="text-muted-foreground leading-6">{proof.cost}</p>
                <Button asChild className="mt-auto w-fit" size="lg">
                  <a
                    href={siteConfig.waitlistUrl}
                    rel="noopener"
                    target="_blank"
                  >
                    <span className="font-medium text-inherit text-sm">
                      Join the waitlist
                    </span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <PanelEdge style="hatch" />
      </div>
    </section>
  );
}
