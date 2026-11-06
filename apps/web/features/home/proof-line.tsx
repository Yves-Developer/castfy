import { Band } from "./band";

/**
 * A single fact between the two spotlights, where other pages put a quote:
 * one real run, as it happened.
 */
export function ProofLine() {
  return (
    <Band className="py-16 md:py-24">
      <figure className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
        <blockquote className="text-balance font-[450] text-2xl leading-[1.3] tracking-[-0.02em] md:text-[34px]">
          A Typeform survey, filled in on a Claude subscription:{" "}
          <span className="text-brand">
            7.7 minutes of agent work became a 99.5 s narrated demo
          </span>
          , and no API bill.
        </blockquote>
        <figcaption className="font-mono text-muted-foreground text-xs">
          Crave survey · Castfy beta.25 · the same run at API rates ≈ $1.67
        </figcaption>
      </figure>
    </Band>
  );
}
