import { MousePointer2Icon } from "lucide-react";
import type { ComponentProps } from "react";

/**
 * The play button over every video on the site: Castfy blue, with the logo's
 * arrow turned to point the way play does. Centered on its positioned parent.
 */
export function PlayButton({
  className = "",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={`absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-white shadow-[0_10px_30px_-8px_rgba(0,90,200,0.55)] transition-transform duration-200 hover:scale-105 md:size-20 ${className}`}
      type="button"
      {...props}
    >
      <MousePointer2Icon className="size-7 rotate-[135deg] fill-current md:size-8" />
    </button>
  );
}
