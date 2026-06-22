import type { Metadata } from "next";
import { DashboardHeader } from "@/features/_layout/header";
import { ExperimentTabs } from "@/features/playground/experiment-tabs";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <>
      <DashboardHeader title="Playground" />
      <div className="container max-w-5xl space-y-8 py-8">
        <ExperimentTabs />
      </div>
    </>
  );
}
