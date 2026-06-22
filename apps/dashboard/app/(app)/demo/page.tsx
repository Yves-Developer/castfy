import type { Metadata } from "next";
import { DemoHeader } from "@/features/demo/_layout/header";
import { CustomizeTabs } from "@/features/demo/customize";
import { DemoVideo } from "@/features/demo/video";

export const metadata: Metadata = {
  title: "My demos",
};
export default function NewDemo() {
  return (
    <>
      <DemoHeader />

      <main className="h-[calc(100vh-48px)]">
        <div className="grid h-full grid-rows-12">
          {/* Top section */}
          <div className="row-span-10 grid min-h-0 grid-cols-12 divide-x">
            <div className="col-span-4 min-h-0">
              <CustomizeTabs />
            </div>

            <div className="col-span-8 min-h-0">
              <DemoVideo />
            </div>
          </div>

          {/* Timeline */}
          <div className="row-span-2 border-t">time line</div>
        </div>
      </main>
    </>
  );
}
