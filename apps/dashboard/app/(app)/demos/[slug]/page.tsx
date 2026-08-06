import AppTimelines from "@/features/app/demo/timelines";
import AppVideoEditor from "@/features/app/demo/video-editor";

export default function DemoPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppVideoEditor />

      <footer className="mt-auto h-30 border-t">
        <AppTimelines />
      </footer>
    </div>
  );
}
