import type { Metadata } from "next";
import { DashboardHeader } from "@/features/_layout/header";
import { NewHero } from "@/features/new/hero";
import { NewDemoForm } from "@/features/new/new-form";
export const metadata: Metadata = {
  title: "New demo",
};
export default function NewDemo() {
  return (
    <>
      <DashboardHeader title="New demo" />

      <div className="container mx-auto flex h-full w-full max-w-2xl flex-col justify-center gap-5">
        <NewHero />
        <NewDemoForm />
      </div>
    </>
  );
}
