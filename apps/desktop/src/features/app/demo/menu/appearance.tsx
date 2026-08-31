import {
  DropdownMenuItem,
  DropdownMenuSubContent,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const options = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "System", icon: <MonitorIcon /> },
];
export function Appearance() {
  const { theme, setTheme } = useTheme();

  const isMounted = useSyncExternalStore(
    () => () => {
      //
    },
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <DropdownMenuSubContent className="w-50">
        {options.map((option) => (
          <DropdownMenuItem key={option.value}>
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    );
  }
  return (
    <DropdownMenuSubContent className="w-50">
      {options.map((option) => (
        <DropdownMenuItem
          key={option.value}
          onClick={() => setTheme(option.value)}
        >
          {option.icon}
          {option.label}
          {theme === option.value && <CheckIcon className="ml-auto" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuSubContent>
  );
}
