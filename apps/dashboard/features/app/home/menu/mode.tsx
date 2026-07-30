import { buttonVariants } from "@castfy/ui/components/button";
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@castfy/ui/components/dropdown-menu";
import { cn } from "@castfy/ui/lib/utils";
import { useTheme } from "next-themes";
import { useCallback, useSyncExternalStore } from "react";

export function ModeSwitcher() {
  const { theme, setTheme } = useTheme();

  const isMounted = useSyncExternalStore(
    () => () => {
      //
    },
    () => true,
    () => false
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);
  if (!isMounted) {
    return (
      <DropdownMenuItem
        className={cn(
          buttonVariants({ size: "sm", variant: "ghost" }),
          "w-full justify-start text-xs"
        )}
      >
        Mode
        <DropdownMenuShortcut>Alt+N</DropdownMenuShortcut>
      </DropdownMenuItem>
    );
  }
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ size: "sm", variant: "ghost" }),
        "w-full justify-start text-xs"
      )}
      onClick={toggleTheme}
    >
      {theme === "dark" ? "Light mode" : "Night mode"}
      <DropdownMenuShortcut>Alt+N</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}
