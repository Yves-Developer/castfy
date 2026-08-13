import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@castfy/ui/components/dropdown-menu";
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
      <DropdownMenuItem>
        Mode
        <DropdownMenuShortcut>Alt+N</DropdownMenuShortcut>
      </DropdownMenuItem>
    );
  }
  return (
    <DropdownMenuItem onClick={toggleTheme}>
      {theme === "dark" ? "Light mode" : "Night mode"}
      <DropdownMenuShortcut>Alt+N</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}
