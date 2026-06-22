import type { Metadata } from "next";
import { DashboardHeader } from "@/features/_layout/header";

export const metadata: Metadata = {
  title: "Billing",
};
export default function Billing() {
  return (
    <>
      <DashboardHeader title="Billing" />

      <div className="container flex h-full w-full flex-col gap-5 py-10">
        Billing list
      </div>
    </>
  );
}
