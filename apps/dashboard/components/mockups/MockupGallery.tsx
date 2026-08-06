"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@castfy/ui/components/tabs";
import {
  ComputerIcon,
  LaptopIcon,
  SmartPhone01Icon,
  Watch02Icon,
} from "hugeicons-react";
import Image from "next/image";
import { useState } from "react";
import { useResponsiveCanvasDimensions } from "@/hooks/use-aspect-ratio-dimensions";
import { getMockupsByType, MOCKUP_DEFINITIONS } from "@/lib/constants/mockups";
import { useImageStore } from "@/lib/store";

export function MockupGallery() {
  const { addMockup } = useImageStore();
  const [activeType, setActiveType] = useState<
    "iphone" | "macbook" | "imac" | "iwatch"
  >("macbook");
  const responsiveDimensions = useResponsiveCanvasDimensions();

  const getDefaultPosition = (mockupSize: number, mockupType: string) => {
    const canvasWidth = responsiveDimensions.width || 1920;
    const canvasHeight = responsiveDimensions.height || 1080;

    let aspectRatio = 16 / 9;
    if (mockupType === "iphone") {
      aspectRatio = 9 / 16;
    } else if (mockupType === "iwatch") {
      aspectRatio = 1;
    } else if (mockupType === "imac") {
      aspectRatio = 2146 / 1207;
    }

    const mockupHeight = mockupSize / aspectRatio;

    return {
      x: Math.max(20, canvasWidth / 2 - mockupSize / 2),
      y: Math.max(20, canvasHeight / 2 - mockupHeight / 2),
    };
  };

  const handleAddMockup = (definitionId: string) => {
    const definition = MOCKUP_DEFINITIONS.find((d) => d.id === definitionId);
    let defaultSize = 600;
    if (definition?.type === "iphone") {
      defaultSize = 220;
    } else if (definition?.type === "iwatch") {
      defaultSize = 150;
    } else if (definition?.type === "imac") {
      defaultSize = 500;
    }

    const defaultPosition = getDefaultPosition(
      defaultSize,
      definition?.type || "macbook"
    );

    addMockup({
      definitionId,
      position: defaultPosition,
      size: defaultSize,
      rotation: 0,
      opacity: 1,
      isVisible: true,
      imageFit: "cover",
    });
  };

  const macbookMockups = getMockupsByType("macbook");
  const iphoneMockups = getMockupsByType("iphone");
  const imacMockups = getMockupsByType("imac");
  const iwatchMockups = getMockupsByType("iwatch");

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h3 className="font-semibold text-foreground text-sm">
          Device Mockups
        </h3>
        <p className="text-muted-foreground text-xs">
          Add device frames to showcase your designs
        </p>
      </div>

      <Tabs
        onValueChange={(v) =>
          setActiveType(v as "iphone" | "macbook" | "imac" | "iwatch")
        }
        value={activeType}
      >
        <TabsList className="grid h-12 w-full grid-cols-4 gap-1.5 rounded-none bg-transparent p-1.5">
          <TabsTrigger
            className="gap-1.5 rounded-md border-0 text-xs transition-all duration-200 data-[state=active]:border-0 data-[state=active]:bg-background"
            value="macbook"
          >
            <LaptopIcon className="h-3.5 w-3.5" />
            <span>MacBook</span>
          </TabsTrigger>
          <TabsTrigger
            className="gap-1.5 rounded-md border-0 text-xs transition-all duration-200 data-[state=active]:border-0 data-[state=active]:bg-background"
            value="imac"
          >
            <ComputerIcon className="h-3.5 w-3.5" />
            <span>iMac</span>
          </TabsTrigger>
          <TabsTrigger
            className="gap-1.5 rounded-md border-0 text-xs transition-all duration-200 data-[state=active]:border-0 data-[state=active]:bg-background"
            value="iwatch"
          >
            <Watch02Icon className="h-3.5 w-3.5" />
            <span>Watch</span>
          </TabsTrigger>
          <TabsTrigger
            className="gap-1.5 rounded-md border-0 text-xs transition-all duration-200 data-[state=active]:border-0 data-[state=active]:bg-background"
            value="iphone"
          >
            <SmartPhone01Icon className="h-3.5 w-3.5" />
            <span>iPhone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-5" value="macbook">
          <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto">
            {macbookMockups.map((mockup) => (
              <button
                className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary"
                key={mockup.id}
                onClick={() => handleAddMockup(mockup.id)}
                type="button"
              >
                <Image
                  alt={mockup.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  src={mockup.src}
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-foreground/60 to-transparent p-2">
                  <p className="truncate font-medium text-background text-xs">
                    {mockup.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-5" value="imac">
          <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto">
            {imacMockups.map((mockup) => (
              <button
                className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary"
                key={mockup.id}
                onClick={() => handleAddMockup(mockup.id)}
                type="button"
              >
                <Image
                  alt={mockup.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  src={mockup.src}
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
                <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-foreground/60 to-transparent p-2">
                  <p className="truncate font-medium text-background text-xs">
                    {mockup.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-5" value="iwatch">
          <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto">
            {iwatchMockups.map((mockup) => (
              <button
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary"
                key={mockup.id}
                onClick={() => handleAddMockup(mockup.id)}
                type="button"
              >
                <Image
                  alt={mockup.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  src={mockup.src}
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
                <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-foreground/60 to-transparent p-2">
                  <p className="truncate font-medium text-background text-xs">
                    {mockup.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-5" value="iphone">
          {iphoneMockups.length > 0 ? (
            <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto">
              {iphoneMockups.map((mockup) => (
                <button
                  className="group relative aspect-9/16 overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary"
                  key={mockup.id}
                  onClick={() => handleAddMockup(mockup.id)}
                  type="button"
                >
                  <Image
                    alt={mockup.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    src={mockup.src}
                  />
                  <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
                  <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-foreground/60 to-transparent p-2">
                    <p className="truncate font-medium text-background text-xs">
                      {mockup.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <SmartPhone01Icon className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>iPhone mockups coming soon</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
