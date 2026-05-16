import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import Image from "next/image";

export function WaitlistSection() {
  return (
    <main className="overflow-hidden">
      <section className="bg-background">
        <div className="relative">
          <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] mask-t-from-50% absolute inset-0 aspect-square lg:top-24 lg:aspect-9/4">
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
                Ship faster. Integrate smarter.
              </h1>
              <p className="mt-4 text-balance text-muted-foreground">
                Veil is your all-in-one engine for adding seamless integrations
                to your app.
              </p>

              <div className="relative z-20 mt-10 flex w-full max-w-md items-center gap-3 rounded-full p-1">
                <Input
                  className="h-10 w-full rounded-xl border-none bg-muted shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-0 active:ring-0"
                  placeholder="Enter your email"
                />
                <Button className="h-10 rounded-xl px-6">
                  Join the waitlist
                </Button>
              </div>
            </div>
            <div className="mx-auto mt-24 max-w-xl">
              <div className="grid scale-95 grid-cols-3 gap-12 **:fill-foreground">
                <div className="ml-auto blur-[2px]">
                  <Card className="flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Supabase
                    </span>
                  </Card>
                </div>
                <div className="ml-auto">
                  <Card className="flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="block text-nowrap font-medium max-sm:text-xs">
                      Slack
                    </span>
                  </Card>
                </div>
                <div className="ml-auto blur-[2px]">
                  <Card className="flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Figma
                    </span>
                  </Card>
                </div>
                <div className="mr-auto">
                  <Card className="flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Vercel
                    </span>
                  </Card>
                </div>
                <div className="blur-[2px]">
                  <Card className="flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Firebase
                    </span>
                  </Card>
                </div>
                <div>
                  <Card className="mx-a flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Linear
                    </span>
                  </Card>
                </div>
                <div className="ml-auto blur-[2px]">
                  <Card className="flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Twilio
                    </span>
                  </Card>
                </div>
                <div>
                  <Card className="mx-a flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Claude AI
                    </span>
                  </Card>
                </div>
                <div className="blur-[2px]">
                  <Card className="flex h-8 w-fit items-center justify-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:px-4">
                    <span className="text-nowrap font-medium max-sm:text-xs">
                      Clerk{" "}
                    </span>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
