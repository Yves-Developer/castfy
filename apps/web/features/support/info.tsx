import { MailIcon, MapPinIcon, MessageCircleIcon } from "lucide-react";

export function SupportInfo() {
  return (
    <div className="flex flex-col gap-10">
      <h3 className="text-balance font-medium @5xl:text-[64px] text-[32px] leading-9 md:text-[44px] md:leading-12 lg:text-[52px] lg:leading-13.25 xl:leading-16">
        Contact our sales team
      </h3>
      <p className="text-balance">
        Make your product demo easy and fast to create. Start today.
      </p>
      <div className="flex flex-col gap-4 font-medium text-sm">
        <p className="text-muted-foreground">More on: </p>
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center gap-2">
            <MessageCircleIcon className="size-4" />
            <span className="text-muted-foreground">Whatsapp: </span> +250 799
            123 456
          </div>
          <div className="relative flex items-center gap-2">
            <MapPinIcon className="size-4" />
            <span className="text-muted-foreground">Location: </span> Kigali,
            Rwanda
          </div>
          <div className="relative flex items-center gap-2">
            <MailIcon className="size-4" />
            <span className="text-muted-foreground">Email: </span>{" "}
            casfy@gmail.com
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 font-medium text-sm md:gap-4">
        <p className="text-muted-foreground">
          Trusted by thousands of businesses like{" "}
        </p>
      </div>
    </div>
  );
}
