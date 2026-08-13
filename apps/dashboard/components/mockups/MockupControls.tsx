"use client";

import { Button } from "@castfy/ui/components/button";
import { Delete02Icon, ViewIcon, ViewOffSlashIcon } from "hugeicons-react";
import Image from "next/image";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { getMockupDefinition } from "@/lib/constants/mockups";
import { useImageStore } from "@/lib/store";

export function MockupControls() {
  const { mockups, updateMockup, removeMockup, clearMockups } = useImageStore();

  const [selectedMockupId, setSelectedMockupId] = useState<string | null>(null);

  const selectedMockup = mockups.find(
    (mockup) => mockup.id === selectedMockupId
  );

  const selectedDefinition = selectedMockup
    ? getMockupDefinition(selectedMockup.definitionId)
    : null;

  const handleUpdateSize = (value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, { size: value[0] });
    }
  };

  const handleUpdateRotation = (value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, { rotation: value[0] });
    }
  };

  const handleUpdateOpacity = (value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, { opacity: value[0] });
    }
  };

  const handleToggleVisibility = (id: string) => {
    const mockup = mockups.find((m) => m.id === id);
    if (mockup) {
      updateMockup(id, { isVisible: !mockup.isVisible });
    }
  };

  const handleUpdatePosition = (axis: "x" | "y", value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, {
        position: {
          ...selectedMockup.position,
          [axis]: value[0],
        },
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Mockups</h3>
        <Button
          className="h-8 rounded-lg px-3 font-medium text-xs"
          disabled={mockups.length === 0}
          onClick={clearMockups}
          size="sm"
          variant="outline"
        >
          Clear All
        </Button>
      </div>

      {mockups.length > 0 && (
        <div className="space-y-4">
          <p className="font-semibold text-foreground text-sm">
            Manage Mockups
          </p>
          <div className="max-h-32 space-y-2 overflow-y-auto">
            {mockups.map((mockup) => {
              const definition = getMockupDefinition(mockup.definitionId);
              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: <explanation
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation
                // biome-ignore lint/a11y/noNoninteractiveElementInteractions: <explanation
                <div
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2 transition-colors ${
                    selectedMockupId === mockup.id
                      ? "border-primary bg-accent"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                  key={mockup.id}
                  onClick={() => setSelectedMockupId(mockup.id)}
                >
                  <Button
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(mockup.id);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {mockup.isVisible ? (
                      <ViewIcon className="h-3 w-3" />
                    ) : (
                      <ViewOffSlashIcon className="h-3 w-3" />
                    )}
                  </Button>
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                    {definition && (
                      <Image
                        alt={definition.name}
                        className="object-cover"
                        fill
                        sizes="32px"
                        src={definition.src}
                      />
                    )}
                  </div>
                  <span className="flex-1 truncate text-xs">
                    {definition?.name || "Mockup"}
                  </span>
                  <Button
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMockup(mockup.id);
                      if (selectedMockupId === mockup.id) {
                        setSelectedMockupId(null);
                      }
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Delete02Icon className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedMockup && selectedDefinition && (
        <div className="space-y-5 border-t pt-5">
          <div className="space-y-5">
            <p className="font-semibold text-foreground text-sm">Edit Mockup</p>

            <div className="rounded-xl border border-border bg-muted p-3">
              <Slider
                label="Size"
                max={1200}
                min={200}
                onValueChange={handleUpdateSize}
                step={10}
                value={[selectedMockup.size]}
                valueDisplay={`${selectedMockup.size}px`}
              />
            </div>

            <div className="rounded-xl border border-border bg-muted p-3">
              <Slider
                label="Rotation"
                max={360}
                min={0}
                onValueChange={handleUpdateRotation}
                step={1}
                value={[selectedMockup.rotation]}
                valueDisplay={`${selectedMockup.rotation}°`}
              />
            </div>

            <div className="rounded-xl border border-border bg-muted p-3">
              <Slider
                label="Opacity"
                max={1}
                min={0}
                onValueChange={handleUpdateOpacity}
                step={0.01}
                value={[selectedMockup.opacity]}
                valueDisplay={`${Math.round(selectedMockup.opacity * 100)}%`}
              />
            </div>

            <div className="space-y-4">
              <p className="font-semibold text-foreground text-sm">Position</p>
              <div className="rounded-lg border border-border/50 bg-muted/50 p-3">
                <Slider
                  label="X Position"
                  max={1600}
                  min={0}
                  onValueChange={(value) => handleUpdatePosition("x", value)}
                  step={1}
                  value={[selectedMockup.position.x]}
                  valueDisplay={`${Math.round(selectedMockup.position.x)}px`}
                />
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/50 p-3">
                <Slider
                  label="Y Position"
                  max={1000}
                  min={0}
                  onValueChange={(value) => handleUpdatePosition("y", value)}
                  step={1}
                  value={[selectedMockup.position.y]}
                  valueDisplay={`${Math.round(selectedMockup.position.y)}px`}
                />
              </div>
            </div>

            <Button
              className="h-10 w-full rounded-xl"
              onClick={() => {
                removeMockup(selectedMockup.id);
                setSelectedMockupId(null);
              }}
              size="sm"
              variant="destructive"
            >
              <Delete02Icon className="mr-2 h-4 w-4" />
              Remove Mockup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
