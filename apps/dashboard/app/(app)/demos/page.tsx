import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "My demos",
};
export default function NewDemo() {
  return (
    <>
      <AppSiteHeader title="My demos" />

      <div className="container flex h-full w-full flex-col gap-5 py-10">
        demo list
      </div>
    </>
  );
}
