import Image from "next/image";

export function EditorVideo() {
  return (
    <div className="relative mx-auto my-6 h-full w-full max-w-160 overflow-hidden rounded-2xl bg-muted">
      <Image alt="background" fill src="/asset-1.jpg" />
    </div>
  );
}
