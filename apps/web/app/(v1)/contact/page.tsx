import type { Metadata } from "next";
import { SupportForm } from "@/features/support/form";
import { SupportInfo } from "@/features/support/info";

export const metadata: Metadata = {
  title: "Contact us",
};
export default function ContactPage() {
  return (
    <div className="container flex h-full w-full flex-col gap-5 py-20">
      <div className="col-span-12 grid w-full @md:grid-cols-[1fr_2fr] grid-cols-1 items-stretch @md:gap-6 gap-4">
        <SupportInfo />
        <SupportForm />
      </div>
    </div>
  );
}
