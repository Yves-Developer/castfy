import type { Metadata } from "next";
import { ExperimentTabs } from "@/features/app/playground/experiment-tabs";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <div className="container max-w-5xl space-y-8 py-8">
      <ExperimentTabs />
    </div>
  );
}
