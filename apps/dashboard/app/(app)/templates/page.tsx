import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "Templates",
};
export default function Templates() {
  return (
    <>
      <AppSiteHeader title="Templates" />

      <div className="container flex h-full w-full flex-col py-10  gap-5">
        Templates list
      </div>
    </>
  );
}
