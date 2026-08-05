import { EditorFooter } from "./footer";
import { StudioCanvas } from "./studio-canvas";

export default function AppVideoEditor() {
  return (
    <div className="flex h-full flex-col gap-4 px-2.5 py-4">
      <StudioCanvas />
      {/*<EditorHeader />*/}
      {/* <EditorVideo /> */}
      <EditorFooter />
    </div>
  );
}
