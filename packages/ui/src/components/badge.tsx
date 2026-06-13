import { cn } from "@castfy/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        // default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        // secondary:
        //   "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        // destructive:
        //   "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        // outline:
        //   "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        default:
          "bg-foreground text-background focus-visible:border-foreground focus-visible:ring-foreground/20 dark:focus-visible:ring-foreground/40 [a&]:hover:bg-foreground/90",

        secondary:
          "border-secondary/20 bg-secondary text-secondary-foreground focus-visible:border-foreground focus-visible:ring-foreground/50 [a&]:hover:bg-secondary/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:text-accent-foreground",
        success:
          "border-success/20 bg-success/10 text-success focus-visible:border-success focus-visible:ring-success/20 [a&]:hover:bg-success/20",
        info: "border-info/20 bg-info/10 text-info focus-visible:border-info focus-visible:ring-info/50 [a&]:hover:bg-info/20",
        warning:
          "border-warning/20 bg-warning/10 text-warning focus-visible:border-warning focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40 [a&]:hover:bg-warning/20",
        destructive:
          "border-destructive-foreground/20 bg-destructive/10 text-destructive-foreground focus-visible:border-destructive focus-visible:ring-destructive/24 dark:bg-destructive/5 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
