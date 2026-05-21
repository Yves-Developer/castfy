import { Avatar, AvatarImage } from "@workspace/ui/components/avatar";
import WaitlistForm from "./waiting-form";

export function WaitlistSection() {
  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-background p-4 py-14 ring ring-muted md:p-6 md:py-20">
        <h1 className="text-balance text-center font-medium text-4xl sm:text-5xl">
          Join the waitlist
        </h1>

        <p className="mt-4 text-balance text-center text-muted-foreground">
          Be among the first to transform any product URL into a stunning,
          interactive demo experience in seconds.
        </p>
        <WaitlistForm />

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
