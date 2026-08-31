"use client";
import { useConvexQuery } from "@/lib/local-query";
import { api } from "@/lib/local-api";
import { projectsToDemos } from "@/lib/projects";
import type { Project } from "@/lib/bridge";
import { DemoCard } from "./card";

export function HomeList() {
  const projects = useConvexQuery<Project[]>(api.projects.list, {});

  if (projects === undefined) {
    return (
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div className="flex flex-col gap-3" key={key}>
            <div className="aspect-video animate-pulse rounded-lg bg-muted" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto flex min-h-full max-w-60 flex-1 flex-col items-center justify-center gap-2.5 text-center text-xs">
        <p className="font-semibold">No demos yet</p>
        <p className="text-balance font-medium text-muted-foreground">
          Create a demo and record it with your agent. It will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      {projectsToDemos(projects).map((demo) => (
        <DemoCard demo={demo} key={demo.slug} />
      ))}
    </div>
  );
}
