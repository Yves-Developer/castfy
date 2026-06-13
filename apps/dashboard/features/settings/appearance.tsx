"use client";
import { cn } from "@castfy/ui/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import darkTheme from "@/public/theme-dark.svg";
import lightTheme from "@/public/theme-light.svg";
import systemTheme from "@/public/theme-system.svg";

interface ThemeOption {
  image: typeof systemTheme;
  label: string;
  value: "system" | "light" | "dark";
}

import { Button } from "@castfy/ui/components/button";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@castfy/ui/components/card";
import { Kbd, KbdGroup } from "@castfy/ui/components/kbd";
import { Label } from "@castfy/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@castfy/ui/components/radio-group";

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: "system",
    label: "System default",
    image: systemTheme,
  },
  {
    value: "light",
    label: "Light",
    image: lightTheme,
  },
  {
    value: "dark",
    label: "Dark",
    image: darkTheme,
  },
];

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  const [selectedTheme, setSelectedTheme] = useState(theme);

  const isMounted = useSyncExternalStore(
    () => () => {
      //
    },
    () => true,
    () => false,
  );

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  if (!isMounted) {
    return null;
  }

  const handleThemeChange = () => {
    if (!selectedTheme) {
      return;
    }
    setTheme(selectedTheme);
  };

  return (
    <div className="space-y-4" id="appearance">
      <CardHeader className="px-0">
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize your workspace appearance.</CardDescription>
        <CardAction>
          <KbdGroup>
            <Kbd>B</Kbd>
          </KbdGroup>
        </CardAction>
      </CardHeader>
      <div aria-label="Theme selection" role="radiogroup">
        <RadioGroup
          className="flex flex-col items-center gap-2 gap-y-4 lg:flex-row"
          onValueChange={setSelectedTheme}
          value={selectedTheme}
        >
          {THEME_OPTIONS.map((option) => (
            <label
              className="flex cursor-pointer flex-col gap-2"
              htmlFor={option.value}
              key={option.value}
            >
              <div
                className={cn(
                  "overflow-hidden rounded-md",
                  selectedTheme === option.value &&
                    "border-2 border-foreground",
                )}
              >
                <Image
                  alt="System Default Theme"
                  className="object-cover"
                  priority={option.value === "system"}
                  src={option.image}
                />
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  // checked={selectedTheme === option.value}
                  id={option.value}
                  value={option.value}
                />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
      <Button onClick={handleThemeChange}>Update</Button>
    </div>
  );
}
