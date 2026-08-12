"use client";
import { Suspense } from "react";
import { NewDemo } from "../new/new-form";
import { HomeFilters } from "./filters";

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
