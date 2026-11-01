import { Button, type ButtonProps } from "@castfy/ui/components/button";
import { Spinner } from "@castfy/ui/components/spinner";
import { cn } from "@castfy/ui/lib/utils";

export function SubmitButton({
  children,
  isSubmitting,
  disabled,
  ...props
}: {
  children: React.ReactNode;
  isSubmitting: boolean;
  disabled?: boolean;
} & ButtonProps) {
  return (
    <Button
      disabled={isSubmitting || disabled}
      {...props}
      className={cn("relative", props.className)}
    >
      {/* Lays the icon and label out in a row, as the Button would without
          this wrapper: on its own the icon is a block and takes a line. */}
      <span
        className={cn(
          "inline-flex items-center gap-2",
          isSubmitting && "invisible"
        )}
      >
        {children}
      </span>
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </Button>
  );
}
