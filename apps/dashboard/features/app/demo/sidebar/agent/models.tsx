import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useCallback, useState } from "react";

const models = [
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o",
    name: "GPT-4o",
    providers: ["openai", "azure"],
  },

  {
    chef: "Google",
    chefSlug: "gemini",
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    providers: ["google", "google-vertex"],
  },

  {
    chef: "Claude",
    chefSlug: "anthropic",
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    providers: ["anthropic"],
  },
];

export function SelectModel({
  selectedModel,
  setSelectedModelAction,
}: {
  selectedModel: string;
  setSelectedModelAction: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleModelSelect = useCallback(
    (id: string) => {
      setSelectedModelAction(id);
      setOpen(false);
    },
    [setSelectedModelAction]
  );

  const selectedModelData = models.find(
    (model) => model.chefSlug === selectedModel
  );
  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs">
        {selectedModelData?.name && <span>{selectedModelData.name}</span>}
        <ChevronDownIcon className="size-3.5" strokeWidth={2.7} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" alignOffset={-10} className="w-50">
        <DropdownMenuGroup>
          {models.map((m) => (
            <DropdownMenuItem
              className="flex justify-between"
              key={m.id}
              onClick={() => handleModelSelect(m.chefSlug)}
            >
              {m.name}
              {selectedModel === m.id && (
                <CheckIcon className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
