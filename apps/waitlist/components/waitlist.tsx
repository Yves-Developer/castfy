import { SendIcon } from "lucide-react";
import WaitlistForm from "./waiting-form";

export function WaitlistSection() {
  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-background p-4 py-14 ring ring-muted md:p-6 md:py-20">
        <div className="flex flex-col items-center justify-center gap-5">
          <SendIcon className="size-10" />
          <h1 className="text-balance text-center font-medium text-4xl sm:text-5xl">
            Join the waitlist
          </h1>

          <p className="text-balance text-center text-muted-foreground">
            Be among the first to transform any product URL into a stunning,
            interactive demo experience in seconds.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
