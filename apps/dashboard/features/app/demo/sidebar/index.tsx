"use client";
import { Button } from "@castfy/ui/components/button";
import { Tabs, TabsContent } from "@castfy/ui/components/tabs";
import { cn } from "@castfy/ui/lib/utils";
import { useState } from "react";
import { AgentTab } from "./agent";
import { BackgroundTab } from "./background";

const tabs = [
  { value: "agent", label: "Agent" },
  { value: "background", label: "Background" },
] as const;
export default function DemoSidebar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState("agent");
  return (
    <div
      className={cn(
        "fixed top-12.75 bottom-0 left-0 w-65 overflow-visible border-r",
        className
      )}
    >
      <Tabs
        className="h-full gap-0"
        defaultValue="agent"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <div className="flex h-13 items-center border-b px-2.5">
          <div className="flex items-center gap-1 bg-transparent">
            {tabs.map((tab) => (
              <Button
                className={cn(
                  "rounded-lg text-xs",
                  activeTab === tab.value
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                size="sm"
                variant={activeTab === tab.value ? "secondary" : "ghost"}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
        <TabsContent className="min-h-0 flex-1 p-2.5" value="agent">
          <AgentTab />
        </TabsContent>

        <TabsContent
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5"
          value="background"
        >
          <BackgroundTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
