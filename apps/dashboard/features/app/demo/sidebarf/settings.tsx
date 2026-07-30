"use client";

import { Button } from "@castfy/ui/components/button";
import { Field, FieldLabel } from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export default function SettingsTab() {
  return (
    <div className="flex flex-col gap-8">
      <Appearance />
      <EditTitle />
      <DeleteProject />
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

function EditTitle() {
  return (
    <div className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor="demo">Title</FieldLabel>
        <Input
          className="text-sm"
          id="demo"
          placeholder="Your title"
          type="password"
        />
      </Field>
      <Button className="w-fit" disabled size="sm">
        Save
      </Button>
    </div>
  );
}

function DeleteProject() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-sm">
        <p>Delete this project</p>
        <p className="text-muted-foreground">
          This action cannot be undone. Please proceed with caution.
        </p>
      </div>
      <Button className="w-fit" disabled size="sm" variant={"destructive"}>
        Delete
      </Button>
    </div>
  );
}
