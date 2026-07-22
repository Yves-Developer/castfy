"use client";

import { Button } from "@castfy/ui/components/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@castfy/ui/components/combobox";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export default function SettingsTab() {
  return (
    <div className="flex flex-col gap-4">
      <Appearance />
      <Language />
    </div>
  );
}

function Appearance() {
  const { theme, setTheme } = useTheme();

  const isMounted = useSyncExternalStore(
    () => () => {
      //
    },
    () => true,
    () => false
  );

  if (!isMounted) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">Appearance</p>
      <div className="flex items-center rounded-lg border p-1">
        <Button
          className="flex-1"
          onClick={() => setTheme("light")}
          size={"sm"}
          variant={theme === "light" ? "secondary" : "ghost"}
        >
          Light
        </Button>
        <Button
          className="flex-1"
          onClick={() => setTheme("dark")}
          size={"sm"}
          variant={theme === "dark" ? "secondary" : "ghost"}
        >
          Dark
        </Button>
        <Button
          className="flex-1"
          onClick={() => setTheme("system")}
          size={"sm"}
          variant={theme === "system" ? "secondary" : "ghost"}
        >
          System
        </Button>
      </div>
    </div>
  );
}

const frameworks = ["English", "French", "Portugues", "Chinese"] as const;

function Language() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">Language</p>
      <Combobox items={frameworks}>
        <ComboboxInput
          inputClassName={"text-[13px] leading-4.5"}
          placeholder="Select a language"
        />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
