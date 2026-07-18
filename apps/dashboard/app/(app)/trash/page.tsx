import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "Trash",
};
export default function Trash() {
  return (
    <>
      <AppSiteHeader title="Trash" />

      <div className="container flex h-full w-full flex-col gap-5 py-10">
        Trash list
      </div>
    </>
  );
}
