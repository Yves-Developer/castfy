import type { Metadata } from "next";
import { DashboardHeader } from "@/features/_layout/header";

export const metadata: Metadata = {
  title: "Trash",
};
export default function Trash() {
  return (
    <>
      <DashboardHeader title="Trash" />

      <div className="container flex h-full w-full flex-col gap-5 py-10">
        Trash list
      </div>
    </>
  );
}
