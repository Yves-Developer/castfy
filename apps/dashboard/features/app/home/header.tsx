"use client";
import { Button } from "@castfy/ui/components/button";
import { Suspense } from "react";
import { ProjectsFilters } from "./filters";

export function ProjectsHeader() {
  return (
    <div className="col-span-full flex items-center justify-between gap-4 pt-8.25">
      <p className="font-bold text-xl">All</p>
      <div className="flex items-center gap-2">
        <Suspense>
          <ProjectsFilters />
        </Suspense>
        <Button size="sm">New Demo</Button>
      </div>
    </div>
  );
}
