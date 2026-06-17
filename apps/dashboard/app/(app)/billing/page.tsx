import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "Billing",
};
export default function Billing() {
  return (
    <>
      <AppSiteHeader title="Billing" />

      <div className="container flex h-full w-full flex-col gap-5 py-10">
        Billing list
      </div>
    </>
  );
}
