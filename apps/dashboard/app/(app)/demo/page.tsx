import type { Metadata } from "next";
import { DemoHeader } from "../../../features/demo/_layout/header";

export const metadata: Metadata = {
  title: "My demos",
};
export default function NewDemo() {
  return (
    <>
      <DemoHeader />

      <div className="grid min-h-[calc(100vh-48px)] grid-rows-12 divide-y">
        <div className="row-span-10 grid grid-cols-12 divide-x">
          <div className="col-span-1">sidebar</div>
          <div className="col-span-4">customize</div>
          <div className="col-span-7">video</div>
        </div>
        <div className="row-span-2">time line</div>
      </div>
    </>
  );
}
