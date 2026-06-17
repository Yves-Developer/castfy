"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import type { JSX } from "react";
import { useSyncExternalStore } from "react";

function ThemeOption({
  icon,
  value,
  isActive,
  onClick,
}: {
  icon: JSX.Element;
  value: string;
  isActive?: boolean;
  onClick: (value: string) => void;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: for now
    <button
      aria-checked={isActive}
      aria-label={`Switch to ${value} theme`}
      className="relative flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[color] hover:text-foreground data-[active=true]:text-foreground [&_svg]:size-4"
      data-active={isActive}
      onClick={() => onClick(value)}
      role="radio"
      type="button"
    >
      {icon}

      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-full border"
          layoutId="theme-option"
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        />
      )}
    </button>
  );
}

const THEME_OPTIONS = [
  {
    icon: <MonitorIcon />,
    value: "system",
  },
  {
    icon: <SunIcon />,
    value: "light",
  },
  {
    icon: <MoonIcon />,
    value: "dark",
  },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const isMounted = useSyncExternalStore(
    () => () => {
      //
    },
    () => true,
    () => false,
  );

  if (!isMounted) {
    return <div className="flex h-8 w-24" />;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="inset-ring-1 inset-ring-border inline-flex items-center overflow-clip rounded-full bg-background"
      initial={{ opacity: 0 }}
      key={String(isMounted)}
      role="radiogroup"
      transition={{ duration: 0.3 }}
    >
      {THEME_OPTIONS.map((option) => (
        <ThemeOption
          icon={option.icon}
          isActive={theme === option.value}
          key={option.value}
          onClick={setTheme}
          value={option.value}
        />
      ))}
    </motion.div>
  );
}

export { ThemeSwitcher };
