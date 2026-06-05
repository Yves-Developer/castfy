import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "Trash",
};
export default function Trash() {
  return (
    <>
      <AppSiteHeader title="Trash" />

      <div className="container flex h-full w-full flex-col py-10  gap-5">
        Trash list
      </div>
    </>
  );
}
