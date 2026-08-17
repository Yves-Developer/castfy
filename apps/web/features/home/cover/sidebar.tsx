import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";

const tabs = [
  { value: "collections", label: "Collections" },
  { value: "fields", label: "Fields" },
  { value: "plugins", label: "Plugins" },
] as const;
export default function CoverCmsSidebar({ className }: { className?: string }) {
  const activeTab = "collections";
  return (
    <div
      className={cn(
        "relative h-screen w-65 overflow-hidden border-r",
        className
      )}
    >
      <div className="h-full gap-0">
        <div className="container flex h-13 items-center border-b">
          <div className="flex items-center gap-1 bg-transparent">
            {tabs.map((tab) => (
              <Button
                className={cn(
                  "cursor-default rounded-lg text-xs",
                  activeTab === tab.value
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
                key={tab.value}
                size="sm"
                variant={activeTab === tab.value ? "secondary" : "ghost"}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1">agent</div>
      </div>
    </div>
  );
}
