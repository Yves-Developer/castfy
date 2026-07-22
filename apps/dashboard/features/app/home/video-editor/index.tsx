import { EditorFooter } from "./footer";
import { EditorHeader } from "./header";
import { EditorVideo } from "./video";

export default function AppVideoEditor() {
  return (
    <div className="flex h-full flex-col px-2 py-4">
      <EditorHeader />
      <EditorVideo />
      <EditorFooter />
    </div>
  );
}
