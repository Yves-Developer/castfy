import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";
import { SupportForm } from "@/features/support/form";
import { SupportInfo } from "@/features/support/info";

export const metadata: Metadata = {
  title: "Support",
};
export default function Support() {
  return (
    <>
      <AppSiteHeader title="Support" />

      <div className="container  flex h-full w-full flex-col py-10  gap-5">
        <div className="col-span-12 grid w-full @md:grid-cols-[1fr_2fr] grid-cols-1 items-stretch @md:gap-6 gap-4">
          <SupportInfo />
          <SupportForm />
        </div>
      </div>
    </>
  );
}
