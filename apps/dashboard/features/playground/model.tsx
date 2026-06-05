"use client";

import { Button } from "@castfy/ui/components/button";
import { CheckIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/custom/model-selector";

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
    id: "claude-4.5-sonnet",
    name: "Claude 4.5 Sonnet",
    providers: ["anthropic"],
  },
];

interface ModelItemProps {
  model: (typeof models)[0];
  selectedModel: string;
  onSelect: (id: string) => void;
}

const ModelItem = memo(({ model, selectedModel, onSelect }: ModelItemProps) => {
  const handleSelect = useCallback(
    () => onSelect(model.chefSlug),
    [onSelect, model.chefSlug],
  );
  return (
    <ModelSelectorItem key={model.id} onSelect={handleSelect} value={model.id}>
      <ModelSelectorLogo provider={model.chefSlug} />
      <ModelSelectorName>{model.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {model.providers.map((provider) => (
          <ModelSelectorLogo key={provider} provider={provider} />
        ))}
      </ModelSelectorLogoGroup>
      {selectedModel === model.id ? (
        <CheckIcon className="ml-auto size-4" />
      ) : (
        <div className="ml-auto size-4" />
      )}
    </ModelSelectorItem>
  );
});

ModelItem.displayName = "ModelItem";

export function Model({
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
    [setSelectedModelAction],
  );

  const selectedModelData = models.find(
    (model) => model.chefSlug === selectedModel,
  );

  // Get unique chefs in order of appearance
  const chefs = [...new Set(models.map((model) => model.chef))];

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <ModelSelectorTrigger asChild>
        <Button className="w-50 justify-between" variant="outline">
          {selectedModelData?.chefSlug && (
            <ModelSelectorLogo provider={selectedModelData.chefSlug} />
          )}
          {selectedModelData?.name && (
            <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
          )}
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {chefs.map((chef) => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {models
                .filter((model) => model.chef === chef)
                .map((model) => (
                  <ModelItem
                    key={model.id}
                    model={model}
                    onSelect={handleModelSelect}
                    selectedModel={selectedModel}
                  />
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
