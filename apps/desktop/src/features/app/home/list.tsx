"use client";
import type { Project } from "@/lib/bridge";
import { api } from "@/lib/local-api";
import { useConvexQuery } from "@/lib/local-query";
import { projectsToDemos } from "@/lib/projects";
import { useHomeFilters } from "@/lib/store/home-filters";
import { DemoCard } from "./card";

const WHITESPACE = /\s+/;

/** Projects whose title has every word of the search, in any order. */
function matchesSearch(project: Project, query: string): boolean {
  const title = project.title.toLowerCase();
  return query
    .toLowerCase()
    .split(WHITESPACE)
    .filter(Boolean)
    .every((word) => title.includes(word));
}

/** The order picked in the header's sort menu (HomeFilters). */
function sortProjects(projects: Project[], order: string): Project[] {
  const sorted = [...projects];
  if (order === "alphabetically") {
    return sorted.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );
  }
  if (order === "last_updated") {
    return sorted.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  return sorted.sort((a, b) => b.createdAt - a.createdAt);
}

export function HomeList() {
  const projects = useConvexQuery<Project[]>(api.projects.list, {});
  const q = useHomeFilters((s) => s.query);
  const c = useHomeFilters((s) => s.order);

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

  const shown = sortProjects(
    projects.filter((project) => matchesSearch(project, q)),
    c
  );

  if (shown.length === 0) {
    return (
      <div className="mx-auto flex min-h-full max-w-60 flex-1 flex-col items-center justify-center gap-2.5 text-center text-xs">
        <p className="font-semibold">No demos match “{q}”</p>
        <p className="text-balance font-medium text-muted-foreground">
          Try another word, or clear the search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      {projectsToDemos(shown).map((demo) => (
        <DemoCard demo={demo} key={demo.slug} />
      ))}
    </div>
  );
}
