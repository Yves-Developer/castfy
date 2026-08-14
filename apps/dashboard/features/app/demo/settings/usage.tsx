import { Button } from "@castfy/ui/components/button";

export function DemoUsage() {
  return (
    <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-5">
      <p className="text-center font-medium text-muted-foreground text-xs">
        There&apos;s no active subscription for this workspace. To start a
        subscription, upgrade your project.
      </p>
      <Button size="sm">Upgrade</Button>
    </div>
  );
}
