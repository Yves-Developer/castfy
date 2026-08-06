"use client";
import { Button } from "@castfy/ui/components/button";
import { Field } from "@castfy/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@castfy/ui/components/input-group";
import { Switch } from "@castfy/ui/components/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@castfy/ui/components/tooltip";
import { ArrowUpIcon } from "lucide-react";
import { useState } from "react";
import { SelectModel } from "./models";
import DemoUrl from "./url";

export type AIProvider = "anthropic" | "openai" | "gemini";
export function AgentTab() {
  const [selectedModel, setSelectedModel] = useState<AIProvider>("anthropic");
  return (
    <div className="flex h-full flex-col">
      <DemoUrl />
      <div className="flex h-full flex-1 items-center justify-center">
        <p className="text-center font-medium text-muted-foreground">
          Get started with <br /> our agent
        </p>
      </div>
      <Field className="mt-auto block">
        <InputGroup>
          <InputGroupTextarea
            className="text-xs"
            placeholder="Generate demo..."
          />
          <InputGroupAddon
            align="block-end"
            className="flex justify-between border-foreground/10 border-t"
          >
            <SelectModel
              selectedModel={selectedModel}
              setSelectedModelAction={(id) => {
                setSelectedModel(id as AIProvider);
              }}
            />
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch id="headless" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    If enabled, the browser will run in the background. Disable
                    this if you want to visually observe the browser actions on
                    screen.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Button className="rounded-full" disabled size="icon-xs">
                <ArrowUpIcon strokeWidth={2.7} />
              </Button>
            </div>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
