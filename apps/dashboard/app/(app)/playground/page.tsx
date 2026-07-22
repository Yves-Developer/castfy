import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/app/_layout/app-header";
import { ExperimentTabs } from "@/features/app/playground/experiment-tabs";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <>
      <AppSiteHeader title="Playground" />
      <div className="container max-w-5xl space-y-8 py-8">
        <ExperimentTabs />
      </div>
    </>
  );
}
