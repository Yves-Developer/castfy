import { Avatar, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import Image from "next/image";

export function WaitlistSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center">
      <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] mask-t-from-50% absolute inset-0 aspect-square lg:top-24 lg:aspect-9/4 dark:opacity-5">
        <Image
          alt="hero background"
          className="size-full object-cover object-top"
          height={1740}
          src="/cover.avif"
          width={2268}
        />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-balance font-medium font-serif text-4xl sm:text-5xl">
            Your product, demoed in seconds.
          </h1>
          <p className="mt-4 text-balance text-muted-foreground">
            Paste your URL and watch AI turn your website into a beautiful,
            interactive product tour — no setup required.
          </p>

          <div className="relative z-20 mt-10 flex w-full max-w-md flex-col items-center justify-center gap-3 md:flex-row">
            <Input
              className="h-10 w-full rounded-xl border-none bg-muted shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-0 active:ring-0"
              placeholder="Enter your email"
            />
            <Button className="h-10 rounded-xl px-6">Join the waitlist</Button>
          </div>
        </div>
        <div className="mt-10 hidden items-center justify-center gap-2 md:flex">
          <span className="inline-flex items-center -space-x-2.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Avatar className="size-6" key={index}>
                <AvatarImage
                  alt="placeholder"
                  src={`https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/avatar${index + 1}.png`}
                />
              </Avatar>
            ))}
          </span>
          <p className="text-muted-foreground tracking-tight">
            +1000 people already joined
          </p>
        </div>
      </div>
    </section>
  );
}
