import type { ReactNode } from "react";

/** Where people reach Castfy about their data, their purchase or these terms. */
export const LEGAL_EMAIL = "castfy.app@gmail.com";

/** The date the legal pages last changed; shown on each of them. */
export const LEGAL_UPDATED = "November 6, 2026";

/** A legal page: a title, when it last changed, then its sections. */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="container flex max-w-3xl flex-col gap-10 py-20">
      <header className="flex flex-col gap-3">
        <h1 className="font-medium text-3xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">
          Last updated {LEGAL_UPDATED}
        </p>
        <div className="text-muted-foreground leading-7 [&_a]:text-foreground [&_a]:underline">
          {intro}
        </div>
      </header>
      {children}
    </article>
  );
}

/** One section of a legal page, with its heading. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-medium text-lg">{title}</h2>
      <div className="flex flex-col gap-3 text-muted-foreground leading-7 [&_a]:text-foreground [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

/** The contact address as a mail link. */
export function LegalEmail() {
  return <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;
}
