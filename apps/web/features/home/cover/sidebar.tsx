import { Button } from "@castfy/ui/components/button";
import { Field, FieldLabel } from "@castfy/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@castfy/ui/components/input-group";
import { cn } from "@castfy/ui/lib/utils";
import { ArrowUpIcon, ChevronDownIcon, LinkIcon } from "lucide-react";

const tabs = [
  { value: "agent", label: "Agent" },
  { value: "background", label: "Background" },
] as const;
export default function CoverCmsSidebar({ className }: { className?: string }) {
  const activeTab = "agent";
  return (
    <div className={cn("relative w-65 overflow-hidden border-r", className)}>
      <div className="h-screen gap-0">
        <div className="flex h-13 items-center border-b px-2.5">
          <div className="flex items-center gap-1 bg-transparent">
            {tabs.map((tab) => (
              <Button
                className={cn(
                  "cursor-default rounded-lg text-xs",
                  activeTab === tab.value
                    ? "bg-background font-semibold text-foreground shadow-xs hover:bg-background dark:bg-secondary"
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
        <div className="h-[calc(100vh-52px)] p-2.5">
          <div className="flex h-full flex-col justify-between">
            <InputGroup className="h-7.5">
              <InputGroupInput
                autoComplete="off"
                className="font-medium text-xs placeholder:text-xs"
                placeholder="Product Url"
              />
              <InputGroupAddon>
                <LinkIcon className="size-3" strokeWidth={2.7} />
              </InputGroupAddon>
            </InputGroup>
            <div className="flex h-full flex-1 items-center justify-center">
              <p className="text-center font-medium text-muted-foreground">
                Get started with <br /> our agent
              </p>
            </div>
            <div className="mt-auto block">
              <InputGroup>
                <Field>
                  <FieldLabel className="sr-only">AI Prompt</FieldLabel>
                  <InputGroupTextarea
                    className="resize-none text-xs"
                    placeholder="Generate demo..."
                    rows={6}
                  />
                </Field>

                <InputGroupAddon
                  align="block-end"
                  className="flex justify-between border-foreground/10 border-t"
                >
                  <Button
                    className="flex items-center gap-1 text-xs"
                    variant={"secondary"}
                  >
                    Claude Code
                    <ChevronDownIcon className="size-3.5" strokeWidth={2.7} />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      className="rounded-full"
                      disabled
                      size="icon-xs"
                      type="submit"
                    >
                      <ArrowUpIcon strokeWidth={2.7} />
                    </Button>
                  </div>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
