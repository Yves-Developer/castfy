import { PlusIcon } from "lucide-react";
import { SiteButton } from "@/components/site-button";
import { faqs } from "@/config/data";
import { siteConfig } from "@/config/site";

/**
 * Quick answers: the title and a way to ask on the left, the questions on
 * the right, numbered like steps. Native <details>, so they open without
 * JavaScript; sharing a name makes opening one close the others.
 */
export default function HomeFaqs() {
  return (
    <section
      className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20"
      id="faqs"
    >
      <div className="flex flex-col items-start gap-4 lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-h2">Quick answers.</h2>
        <p className="max-w-sm text-sub">
          What people ask before they download. Anything else, ask us in the
          Discord.
        </p>
        <SiteButton
          arrow
          external
          href={siteConfig.discordUrl}
          size="sm"
          variant="outline"
        >
          Ask in the Discord
        </SiteButton>
      </div>

      <div className="border-t">
        {faqs.map((f, i) => (
          <details
            className="group border-b"
            key={f.question}
            name="faq"
            open={i === 0}
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <span className="w-6 shrink-0 font-mono text-muted-foreground text-xs">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-lg leading-7">{f.question}</span>
              <span className="grid size-7 shrink-0 place-items-center rounded-full border text-muted-foreground transition-transform duration-200 group-open:rotate-45 group-open:border-brand group-open:text-brand">
                <PlusIcon className="size-3.5" />
              </span>
            </summary>
            <p className="pr-11 pb-6 pl-10 text-muted-foreground leading-7">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
