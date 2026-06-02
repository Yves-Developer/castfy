import { Button } from "@castfy/ui/components/button";
import type { Route } from "next";
import Link from "next/link";

export function Cta({
  title,
  desc,
  link,
}: {
  title: string;
  desc?: string;
  link: { href: string; label: string };
}) {
  return (
    <section className="relative grid grid-cols-12 overflow-hidden rounded-md border-t py-15 md:py-30">
      <div className="relative @md:col-span-8 col-span-12 @md:col-start-3 flex flex-col gap-8 @md:px-0 px-4">
        <h2 className="text-center text-3xl md:text-5xl">{title}</h2>
        {desc && <p className="text-center text-muted-foreground">{desc}</p>}
        <div className="flex flex-col items-center justify-center">
          <Button asChild className="rounded-full" size="xl">
            <Link href={link.href as Route}>{link.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
