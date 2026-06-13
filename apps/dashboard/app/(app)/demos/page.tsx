import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "My demos",
};
export default function NewDemo() {
  return (
    <>
      <AppSiteHeader title="My demos" />

      <div className="container flex h-full w-full flex-col py-10  gap-5">
        demo list
      </div>
    </>
  );
}
