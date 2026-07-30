import { Button } from "@castfy/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { Field } from "@castfy/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@castfy/ui/components/input-group";
import { ArrowUpIcon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export function DemoAgent() {
  return (
    <div>
      <Field>
        <InputGroup>
          <InputGroupTextarea className="text-xs" placeholder="Ask Castfy..." />
          <InputGroupAddon
            align="block-end"
            className="flex justify-between border-foreground/10 border-t"
          >
            <SelectModel />
            <Button className="size-5 rounded" disabled variant="secondary">
              <ArrowUpIcon className="size-3.5" strokeWidth={2.7} />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
const models = [
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
  },
  {
    id: "sonnet-4.6",
    name: "Sonnet 4.6",
  },
];
function SelectModel() {
  const [model, setModel] = useState(models[0].id);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs">
        {models.find((m) => m.id === model)?.name}
        <ChevronDownIcon className="size-3.5" strokeWidth={2.7} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" alignOffset={-10} className="w-50">
        <DropdownMenuGroup>
          {models.map((m) => (
            <DropdownMenuItem
              className="flex justify-between"
              key={m.id}
              onClick={() => setModel(m.id)}
            >
              {m.name}
              {model === m.id && (
                <CheckIcon className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
