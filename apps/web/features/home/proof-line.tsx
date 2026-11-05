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
          A full tour of castfy.app, recorded on a Claude subscription:{" "}
          <span className="text-brand">87.6 s of browsing became 9.9 s</span>,
          and no API bill.
        </blockquote>
        <figcaption className="font-mono text-muted-foreground text-xs">
          castfy.app tour · measured on disk · the same run at API rates ≈ $1.00
        </figcaption>
      </figure>
    </Band>
  );
}
