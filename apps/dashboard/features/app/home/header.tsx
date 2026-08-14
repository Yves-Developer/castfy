"use client";
import { Button } from "@castfy/ui/components/button";
import { Suspense } from "react";
import { useNewDemoStore } from "@/lib/store/dialogs";
import { HomeFilters } from "./filters";

export function HomeHeader() {
  const { open } = useNewDemoStore();
  return (
    <div className="flex items-center justify-between gap-4 pt-8.25">
      <p className="font-bold text-xl">All</p>
      <div className="flex items-center gap-2">
        <Suspense>
          <HomeFilters />
        </Suspense>
        <Button onClick={open} size="sm">
          New Demo
        </Button>
      </div>
    </div>
  );
}
