import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { models } from "@/config/data";

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
