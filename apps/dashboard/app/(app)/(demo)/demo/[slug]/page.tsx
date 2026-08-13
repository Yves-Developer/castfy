import { Suspense } from "react";
import AppVideoEditor from "@/features/app/demo/video-editor";

export default function DemoPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Suspense>
        <AppVideoEditor />
      </Suspense>
    </div>
  );
}
