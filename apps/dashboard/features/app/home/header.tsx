"use client";
import { Suspense } from "react";
import { HomeFilters } from "./filters";
import { NewDemo } from "./new/demo";

export function HomeHeader() {
  return (
    <div className="flex items-center justify-between gap-4 pt-8.25">
      <p className="font-bold text-xl">All</p>
      <div className="flex items-center gap-2">
        <Suspense>
          <HomeFilters />
        </Suspense>
        <NewDemo />
      </div>
    </div>
  );
}
