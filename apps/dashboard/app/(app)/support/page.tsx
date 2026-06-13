import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "Support",
};
export default function Support() {
  return (
    <>
      <AppSiteHeader title="Support" />

      <div className="container flex h-full w-full flex-col py-10  gap-5">
        Support list
      </div>
    </>
  );
}
