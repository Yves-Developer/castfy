import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";

export const metadata: Metadata = {
  title: "Settings",
};
export default function Settings() {
  return (
    <>
      <AppSiteHeader title="Settings" />

      <div className="container flex h-full w-full flex-col py-10  gap-5">
        Settings list
      </div>
    </>
  );
}
