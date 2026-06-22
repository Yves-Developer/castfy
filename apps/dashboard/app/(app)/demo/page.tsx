import type { Metadata } from "next";
import { DemoVideo } from "@/features/demo/video";
import { DemoHeader } from "../../../features/demo/_layout/header";

export const metadata: Metadata = {
  title: "My demos",
};
export default function NewDemo() {
  return (
    <>
      <DemoHeader title="Introducing vendyy" />

      <div className="grid min-h-[calc(100vh-48px)] grid-rows-12 divide-y">
        <div className="row-span-10 grid grid-cols-12 divide-x">
          <div className="col-span-4">customize</div>
          <div className="col-span-8">
            <DemoVideo />
          </div>
        </div>
        <div className="row-span-2">time line</div>
      </div>
    </>
  );
}
